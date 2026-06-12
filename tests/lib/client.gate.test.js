import { vi } from 'vitest';

vi.mock('@/lib/api/csrf', () => ({ getCsrfToken: () => 'csrf-test' }));
vi.mock('@/lib/api/auth', () => ({ refreshAccessToken: vi.fn() }));

import { apiFetch, parseResponse, apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import * as auth from '@/lib/api/auth';

describe('API Client — Production Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  describe('apiFetch core', () => {
    it('handles network failure gracefully', async () => {
      globalThis.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(apiFetch('/test')).rejects.toThrow('Failed to fetch');
    });

    it('handles DNS resolution failure', async () => {
      globalThis.fetch.mockRejectedValue(new TypeError('getaddrinfo ENOTFOUND'));
      await expect(apiFetch('/test')).rejects.toThrow('ENOTFOUND');
    });

    it('handles TLS/SSL errors', async () => {
      globalThis.fetch.mockRejectedValue(new TypeError('certificate has expired'));
      await expect(apiFetch('/test')).rejects.toThrow('certificate');
    });

    it('passes through 5xx server errors', async () => {
      globalThis.fetch.mockResolvedValue({ status: 502, ok: false });
      const res = await apiFetch('/test');
      expect(res.status).toBe(502);
    });

    it('passes through 429 rate limit', async () => {
      globalThis.fetch.mockResolvedValue({ status: 429, ok: false });
      const res = await apiFetch('/test');
      expect(res.status).toBe(429);
    });

    it('passes through 403 forbidden (not 401, no refresh)', async () => {
      globalThis.fetch.mockResolvedValue({ status: 403, ok: false });
      const res = await apiFetch('/test');
      expect(res.status).toBe(403);
      expect(auth.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('refreshes token only once for 401', async () => {
      globalThis.fetch
        .mockResolvedValueOnce({ status: 401, ok: false })
        .mockResolvedValueOnce({ status: 200, ok: true });
      auth.refreshAccessToken.mockResolvedValue({ success: true });
      const res = await apiFetch('/test');
      expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
    });

    it('does not retry if refresh returns false success', async () => {
      globalThis.fetch.mockResolvedValue({ status: 401, ok: false });
      auth.refreshAccessToken.mockResolvedValue({ success: false });
      const res = await apiFetch('/test');
      expect(res.status).toBe(401);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent 401 refresh across different paths', async () => {
      globalThis.fetch
        .mockResolvedValueOnce({ status: 401, ok: false })
        .mockResolvedValueOnce({ status: 200, ok: true })
        .mockResolvedValueOnce({ status: 200, ok: true });
      auth.refreshAccessToken.mockResolvedValue({ success: true });

      const [r1, r2] = await Promise.all([apiFetch('/path1'), apiFetch('/path2')]);
      expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
    });

    it('handles refresh failure by surfacing original 401', async () => {
      globalThis.fetch.mockResolvedValue({ status: 401, ok: false, _tag: 'original' });
      auth.refreshAccessToken.mockRejectedValue(new Error('Refresh server down'));
      const res = await apiFetch('/test');
      expect(res.status).toBe(401);
    });

    it('adds CSRF token for PUT requests', async () => {
      globalThis.fetch.mockResolvedValue({ status: 200, ok: true });
      await apiFetch('/test', { method: 'PUT', body: {} });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: expect.objectContaining({ 'x-csrf-token': 'csrf-test' }) }),
      );
    });

    it('does not add CSRF token for GET requests', async () => {
      globalThis.fetch.mockResolvedValue({ status: 200, ok: true });
      await apiFetch('/test', { method: 'GET' });
      const call = globalThis.fetch.mock.calls[0][1];
      expect(call.headers['x-csrf-token']).toBeUndefined();
    });
  });

  describe('parseResponse error handling', () => {
    it('throws with status and data for 400 validation errors', async () => {
      const res = { ok: false, status: 400, json: () => Promise.resolve({ error: 'Validation failed', details: [{ message: 'Email is required' }] }) };
      await expect(parseResponse(res)).rejects.toMatchObject({ status: 400, message: 'Email is required' });
    });

    it('throws with fallback when payload has no message', async () => {
      const res = { ok: false, status: 500, json: () => Promise.resolve({}) };
      await expect(parseResponse(res, 'Server error')).rejects.toThrow('Server error');
    });

    it('handles JSON parse failure on error response', async () => {
      const res = { ok: false, status: 500, json: () => Promise.reject(new Error('Invalid JSON')) };
      await expect(parseResponse(res, 'Fallback')).rejects.toThrow('Fallback');
    });

    it('handles null response body', async () => {
      const res = { ok: true, json: () => Promise.resolve(null) };
      const result = await parseResponse(res);
      expect(result).toBeNull();
    });

    it('handles array response body', async () => {
      const res = { ok: true, json: () => Promise.resolve([1, 2, 3]) };
      const result = await parseResponse(res);
      expect(result).toEqual([1, 2, 3]);
    });

    it('extracts nested details[0].message for structured errors', async () => {
      const res = { ok: false, status: 422, json: () => Promise.resolve({ details: [{ message: 'Property title is required' }] }) };
      await expect(parseResponse(res)).rejects.toThrow('Property title is required');
    });
  });

  describe('convenience methods', () => {
    it('apiGet throws on 404', async () => {
      globalThis.fetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) });
      await expect(apiGet('/missing')).rejects.toThrow('Not found');
    });

    it('apiPost throws on 400', async () => {
      globalThis.fetch.mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Bad input' }) });
      await expect(apiPost('/test', {})).rejects.toThrow('Bad input');
    });

    it('apiPatch throws on 403', async () => {
      globalThis.fetch.mockResolvedValue({ ok: false, status: 403, json: () => Promise.resolve({ error: 'Forbidden' }) });
      await expect(apiPatch('/test', {})).rejects.toThrow('Forbidden');
    });

    it('apiDelete throws on 500', async () => {
      globalThis.fetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({ message: 'Internal error' }) });
      await expect(apiDelete('/test')).rejects.toThrow('Internal error');
    });
  });
});
