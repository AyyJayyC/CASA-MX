import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as requests from '@/lib/api/requests';

describe('requests API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addRequest calls POST and returns data', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'r1' } });
    const result = await requests.addRequest({ propertyId: 'p1', message: 'Interested' });
    expect(client.apiPost).toHaveBeenCalledWith('/requests', { propertyId: 'p1', message: 'Interested' });
    expect(result.id).toBe('r1');
  });

  it('getMyRequests returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'r1' }] });
    const result = await requests.getMyRequests();
    expect(client.apiGet).toHaveBeenCalledWith('/requests');
    expect(result).toHaveLength(1);
  });

  it('getMyRequests returns empty array on error', async () => {
    client.apiGet.mockRejectedValue(new Error('fail'));
    const result = await requests.getMyRequests();
    expect(result).toEqual([]);
  });

  it('getSellerRequests returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'r1' }] });
    const result = await requests.getSellerRequests();
    expect(client.apiGet).toHaveBeenCalledWith('/requests/seller');
    expect(result).toHaveLength(1);
  });

  it('getSellerRequests returns empty array on error', async () => {
    client.apiGet.mockRejectedValue(new Error('fail'));
    const result = await requests.getSellerRequests();
    expect(result).toEqual([]);
  });

  it('approveRequest calls POST', async () => {
    client.apiPost.mockResolvedValue({ success: true });
    await requests.approveRequest('r1');
    expect(client.apiPost).toHaveBeenCalledWith('/requests/r1/approve');
  });
});
