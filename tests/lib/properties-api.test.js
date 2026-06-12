import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
  apiFetch: vi.fn(),
}));

import * as properties from '@/lib/api/properties';

describe('properties API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProperties builds query string from filters', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'p1' }] });
    const result = await properties.getProperties({ listingType: 'for_sale', colonia: 'Polanco' });
    const callUrl = client.apiGet.mock.calls[0][0];
    expect(callUrl).toContain('listingType=for_sale');
    expect(callUrl).toContain('colonia=Polanco');
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('getProperties with empty filters returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'p1' }] });
    const result = await properties.getProperties();
    expect(client.apiGet).toHaveBeenCalledWith('/properties');
    expect(result).toHaveLength(1);
  });

  it('getProperties returns empty array when no data', async () => {
    client.apiGet.mockResolvedValue({});
    const result = await properties.getProperties();
    expect(result).toEqual([]);
  });

  it('getPropertyById calls GET', async () => {
    client.apiGet.mockResolvedValue({ data: { id: 'p1', title: 'Casa' } });
    const result = await properties.getPropertyById('p1');
    expect(client.apiGet).toHaveBeenCalledWith('/properties/p1');
    expect(result.id).toBe('p1');
  });

  it('getPropertyById returns null on error', async () => {
    client.apiGet.mockRejectedValue(new Error('fail'));
    const result = await properties.getPropertyById('bad');
    expect(result).toBeNull();
  });

  it('addProperty calls POST', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'p1' } });
    const result = await properties.addProperty({ title: 'Casa', price: 1000000 });
    expect(client.apiPost).toHaveBeenCalledWith('/properties', { title: 'Casa', price: 1000000 });
    expect(result.id).toBe('p1');
  });

  it('updateProperty calls PATCH', async () => {
    client.apiPatch.mockResolvedValue({ data: { id: 'p1', title: 'Updated' } });
    const result = await properties.updateProperty('p1', { title: 'Updated' });
    expect(client.apiPatch).toHaveBeenCalledWith('/properties/p1', { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('deleteProperty calls DELETE and returns success', async () => {
    client.apiDelete.mockResolvedValue(undefined);
    const result = await properties.deleteProperty('p1');
    expect(client.apiDelete).toHaveBeenCalledWith('/properties/p1');
    expect(result.success).toBe(true);
  });

  it('publishProperty calls POST', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'p1', status: 'published' } });
    const result = await properties.publishProperty('p1');
    expect(client.apiPost).toHaveBeenCalledWith('/properties/p1/publish');
    expect(result.id).toBe('p1');
  });

  it('getMyProperties returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'p1' }] });
    const result = await properties.getMyProperties({ listingType: 'for_sale' });
    expect(client.apiGet).toHaveBeenCalledWith('/properties/mine?listingType=for_sale');
    expect(result).toHaveLength(1);
  });

  it('getFilterOptions returns data', async () => {
    client.apiGet.mockResolvedValue({ data: { colonias: [], ciudades: [] } });
    const result = await properties.getFilterOptions();
    expect(client.apiGet).toHaveBeenCalledWith('/properties/filter-options');
    expect(result.colonias).toEqual([]);
  });

  it('getFilterOptions returns defaults on error', async () => {
    client.apiGet.mockRejectedValue(new Error('fail'));
    const result = await properties.getFilterOptions();
    expect(result).toEqual({ estados: [], ciudades: {} });
  });
});
