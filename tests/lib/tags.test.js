import { vi } from 'vitest';

globalThis.fetch = vi.fn();

vi.mock('@/lib/api/csrf', () => ({
  getCsrfToken: () => 'mock-csrf',
}));

import * as tags from '@/lib/api/tags';

describe('tags API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTagSubscriptions returns subscriptions array', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscriptions: [{ id: 't1', tagName: 'Polanco' }] }),
    });
    const result = await tags.getTagSubscriptions();
    expect(result).toEqual([{ id: 't1', tagName: 'Polanco' }]);
  });

  it('getTagSubscriptions returns empty array when no subscriptions', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const result = await tags.getTagSubscriptions();
    expect(result).toEqual([]);
  });

  it('getTagSubscriptions throws on error', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Auth required' }),
    });
    await expect(tags.getTagSubscriptions()).rejects.toThrow('Auth required');
  });

  it('addTagSubscription sends POST', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: { id: 't1' } }),
    });
    const result = await tags.addTagSubscription('colonia', 'Polanco', 'CDMX');
    expect(result.id).toBe('t1');
  });

  it('removeTagSubscription sends DELETE', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true, status: 204 });
    await tags.removeTagSubscription('t1');
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('removeTagSubscription throws on error', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });
    await expect(tags.removeTagSubscription('t1')).rejects.toThrow('Server error');
  });

  it('autocompleteTags returns suggestions', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ suggestions: ['Polanco', 'Polanco Norte'] }),
    });
    const result = await tags.autocompleteTags('Pola', 'colonia');
    expect(result.suggestions).toEqual(['Polanco', 'Polanco Norte']);
  });

  it('autocompleteTags returns empty suggestions on error', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
    const result = await tags.autocompleteTags('Pola');
    expect(result.suggestions).toEqual([]);
  });
});
