import { vi } from 'vitest';

globalThis.fetch = vi.fn();

import * as carousel from '@/lib/api/carousel';

describe('carousel API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCarouselSlides returns slides array', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slides: [{ id: 's1', imageUrl: '/test.jpg' }] }),
    });
    const result = await carousel.getCarouselSlides();
    expect(result).toEqual([{ id: 's1', imageUrl: '/test.jpg' }]);
  });

  it('getCarouselSlides returns empty array when no slides', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const result = await carousel.getCarouselSlides();
    expect(result).toEqual([]);
  });

  it('getCarouselSlides throws on error', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false });
    await expect(carousel.getCarouselSlides()).rejects.toThrow('Failed to fetch carousel slides');
  });

  it('getMostViewedProperties returns properties', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ properties: [{ id: 'p1' }] }),
    });
    const result = await carousel.getMostViewedProperties(3);
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('getMostViewedProperties returns empty on error', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network'));
    const result = await carousel.getMostViewedProperties();
    expect(result).toEqual([]);
  });

  it('getMostViewedProperties uses default limit', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ properties: [] }),
    });
    await carousel.getMostViewedProperties();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=6'),
      expect.any(Object),
    );
  });
});
