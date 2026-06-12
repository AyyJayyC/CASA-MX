import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
}));

import * as applications from '@/lib/api/applications';

describe('applications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMyApplications returns data with filters', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'a1' }] });
    const result = await applications.getMyApplications({ status: 'pending' });
    expect(client.apiGet).toHaveBeenCalledWith('/applications?status=pending');
    expect(result).toHaveLength(1);
  });

  it('getMyApplications returns data without filters', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'a1' }] });
    const result = await applications.getMyApplications();
    expect(client.apiGet).toHaveBeenCalledWith('/applications');
    expect(result).toHaveLength(1);
  });

  it('getMyApplications skips undefined/null/empty values', async () => {
    client.apiGet.mockResolvedValue({ data: [] });
    await applications.getMyApplications({ status: undefined, foo: null, bar: '' });
    expect(client.apiGet).toHaveBeenCalledWith('/applications');
  });

  it('getPropertyApplications returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'a1' }] });
    const result = await applications.getPropertyApplications('prop1');
    expect(client.apiGet).toHaveBeenCalledWith('/applications/property/prop1');
    expect(result).toHaveLength(1);
  });

  it('updateApplicationStatus calls PATCH', async () => {
    client.apiPatch.mockResolvedValue({ data: { status: 'approved' } });
    const result = await applications.updateApplicationStatus('a1', { status: 'approved' });
    expect(client.apiPatch).toHaveBeenCalledWith('/applications/a1', { status: 'approved' });
    expect(result.status).toBe('approved');
  });

  it('submitApplication calls POST', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'a1', status: 'pending' } });
    const result = await applications.submitApplication({ propertyId: 'p1', message: 'Hi' });
    expect(client.apiPost).toHaveBeenCalledWith('/applications', { propertyId: 'p1', message: 'Hi' });
    expect(result.id).toBe('a1');
  });
});
