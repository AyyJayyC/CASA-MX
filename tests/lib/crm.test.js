import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

import * as crm from '@/lib/api/crm';

describe('CRM API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBuyers returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'b1', name: 'Buyer 1' }] });
    const result = await crm.getBuyers();
    expect(client.apiGet).toHaveBeenCalledWith('/buyers');
    expect(result).toEqual([{ id: 'b1', name: 'Buyer 1' }]);
  });

  it('getBuyers returns empty array on error', async () => {
    client.apiGet.mockRejectedValue(new Error('Network error'));
    const result = await crm.getBuyers();
    expect(result).toEqual([]);
  });

  it('createBuyer calls POST and returns data', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'b1' } });
    const result = await crm.createBuyer({ name: 'New Buyer' });
    expect(client.apiPost).toHaveBeenCalledWith('/buyers', { name: 'New Buyer' });
    expect(result.id).toBe('b1');
  });

  it('updateBuyer calls PATCH', async () => {
    client.apiPatch.mockResolvedValue({ data: { id: 'b1', name: 'Updated' } });
    const result = await crm.updateBuyer('b1', { name: 'Updated' });
    expect(client.apiPatch).toHaveBeenCalledWith('/buyers/b1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('deleteBuyer calls DELETE', async () => {
    client.apiDelete.mockResolvedValue({ data: { success: true } });
    const result = await crm.deleteBuyer('b1');
    expect(client.apiDelete).toHaveBeenCalledWith('/buyers/b1');
    expect(result.success).toBe(true);
  });
});
