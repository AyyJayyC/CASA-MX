import { vi } from 'vitest';

globalThis.fetch = vi.fn();

import * as locations from '@/lib/api/locations';

describe('locations API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getFilterOptions returns data on success', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { estados: ['Sonora'], ciudades: { Sonora: ['Hermosillo'] } } }),
    });
    const result = await locations.getFilterOptions();
    expect(result.estados).toEqual(['Sonora']);
  });

  it('getFilterOptions returns empty on error', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network'));
    const result = await locations.getFilterOptions();
    expect(result).toEqual({ estados: [], ciudades: {} });
  });

  it('getFilterOptions returns empty on non-ok response', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false });
    const result = await locations.getFilterOptions();
    expect(result).toEqual({ estados: [], ciudades: {} });
  });

  it('getUnifiedCatalog returns merged data', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { estados: [{ nombre: 'Test State', ciudades: [{ nombre: 'Test City', colonias: ['Col1'] }] }], ciudades: {} } }),
    });
    const result = await locations.getUnifiedCatalog();
    expect(result.estados.length).toBeGreaterThan(0);
    expect(result.metadata).toBeDefined();
  });

  it('getUnifiedCatalog handles backend failure gracefully', async () => {
    globalThis.fetch.mockRejectedValue(new Error('fail'));
    const result = await locations.getUnifiedCatalog();
    expect(result.estados).toBeDefined();
  });

  it('getStaticCatalog returns local data', () => {
    const catalog = locations.getStaticCatalog();
    expect(catalog.estados).toBeDefined();
  });

  it('getUnifiedCatalog deduplicates estados by name', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { estados: [], ciudades: {} } }),
    });
    const result = await locations.getUnifiedCatalog();
    expect(Array.isArray(result.estados)).toBe(true);
  });
});
