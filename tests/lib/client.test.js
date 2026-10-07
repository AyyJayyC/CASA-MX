import { vi } from 'vitest';

vi.mock('@/lib/api/csrf', () => ({
  getCsrfToken: () => 'test-csrf-token',
}));

vi.mock('@/lib/api/auth', () => ({
  refreshAccessToken: vi.fn(),
}));

import { apiFetch, apiFormData } from '@/lib/api/client';
import * as auth from '@/lib/api/auth';

globalThis.fetch = vi.fn();

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request and returns response', async () => {
    const mockRes = { status: 200, ok: true };
    globalThis.fetch.mockResolvedValue(mockRes);

    const res = await apiFetch('/test');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' }),
    );
    expect(res.ok).toBe(true);
  });

  it('adds CSRF token for non-GET requests', async () => {
    const mockRes = { status: 200, ok: true };
    globalThis.fetch.mockResolvedValue(mockRes);

    await apiFetch('/test', { method: 'POST', body: { key: 'value' } });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-csrf-token': 'test-csrf-token' }),
      }),
    );
  });

  it('retries on 401 with token refresh', async () => {
    const mockRes401 = { status: 401, ok: false };
    const mockRes200 = { status: 200, ok: true };
    globalThis.fetch
      .mockResolvedValueOnce(mockRes401)
      .mockResolvedValueOnce(mockRes200);

    auth.refreshAccessToken.mockResolvedValue({ success: true });

    const res = await apiFetch('/test');
    expect(auth.refreshAccessToken).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('returns 401 response if refresh fails', async () => {
    const mockRes401 = { status: 401, ok: false };
    globalThis.fetch.mockResolvedValue(mockRes401);
    auth.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

    const res = await apiFetch('/test');
    expect(res.status).toBe(401);
  });

  it('deduplicates concurrent refresh calls', async () => {
    const mockRes401 = { status: 401, ok: false };
    const mockRes200 = { status: 200, ok: true };
    globalThis.fetch
      .mockResolvedValueOnce(mockRes401)
      .mockResolvedValueOnce(mockRes200)
      .mockResolvedValueOnce(mockRes401)
      .mockResolvedValueOnce(mockRes200);

    auth.refreshAccessToken.mockResolvedValue({ success: true });

    await Promise.all([
      apiFetch('/test1'),
      apiFetch('/test2'),
    ]);

    expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
  });
});

describe('apiFormData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs FormData without setting Content-Type', async () => {
    globalThis.fetch.mockResolvedValue({ status: 200, ok: true });
    const form = new FormData();

    await apiFormData('/properties/p1/images', form);

    const [url, opts] = globalThis.fetch.mock.calls[0];
    expect(url).toContain('/properties/p1/images');
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(form);
    expect(opts.headers).not.toHaveProperty('Content-Type');
    expect(opts.headers['x-csrf-token']).toBe('test-csrf-token');
  });

  it('retries once on 401 after refreshing the token', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 201, ok: true });
    auth.refreshAccessToken.mockResolvedValue({ success: true });

    const res = await apiFormData('/x', new FormData());

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(201);
  });
});
