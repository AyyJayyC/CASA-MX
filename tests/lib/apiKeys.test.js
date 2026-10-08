import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

import * as apiKeys from '@/lib/api/apiKeys';

describe('apiKeys API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listApiKeys returns the data array', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'k1', label: 'A' }] });
    const result = await apiKeys.listApiKeys();
    expect(client.apiGet).toHaveBeenCalledWith('/users/me/api-keys');
    expect(result).toHaveLength(1);
  });

  it('listApiKeys handles missing data', async () => {
    client.apiGet.mockResolvedValue({});
    expect(await apiKeys.listApiKeys()).toEqual([]);
  });

  it('createApiKey posts the label and returns the new key', async () => {
    client.apiPost.mockResolvedValue({
      data: { id: 'k1', key: 'cmx_pub_raw', prefix: 'cmx_pub_raw' },
    });
    const result = await apiKeys.createApiKey('Pipeline');
    expect(client.apiPost).toHaveBeenCalledWith('/users/me/api-keys', {
      label: 'Pipeline',
    });
    expect(result.key).toBe('cmx_pub_raw');
  });

  it('revokeApiKey deletes by id', async () => {
    client.apiDelete.mockResolvedValue({ success: true });
    await apiKeys.revokeApiKey('k1');
    expect(client.apiDelete).toHaveBeenCalledWith('/users/me/api-keys/k1');
  });
});
