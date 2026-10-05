import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
}));

vi.mock('@/lib/api/csrf', () => ({
  getCsrfToken: () => 'mock-csrf',
}));

import * as users from '@/lib/api/users';

describe('users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPendingApprovals returns mapped data', async () => {
    client.apiGet.mockResolvedValue({
      data: [{ id: 'a1', user: { id: 'u1', name: 'John', email: 'j@test.com' }, role: { name: 'owner' }, createdAt: '2024-01-01', status: 'pending' }]
    });
    const result = await users.getPendingApprovals();
    expect(result).toHaveLength(1);
    expect(result[0].userName).toBe('John');
    expect(result[0].roleType).toBe('owner');
  });

  it('getPendingApprovals handles empty data', async () => {
    client.apiGet.mockResolvedValue({});
    const result = await users.getPendingApprovals();
    expect(result).toEqual([]);
  });

  it('getUserProfile returns data for specific userId', async () => {
    client.apiGet.mockResolvedValue({ data: { id: 'u1', name: 'Test' } });
    const result = await users.getUserProfile('u1');
    expect(result.id).toBe('u1');
  });

  it('getUserProfile returns null for 404', async () => {
    const err = new Error('Not found');
    err.status = 404;
    client.apiGet.mockRejectedValue(err);
    const result = await users.getUserProfile('bad-id');
    expect(result).toBeNull();
  });

  it('getUserProfile rethrows non-404 errors', async () => {
    const err = new Error('Server error');
    err.status = 500;
    client.apiGet.mockRejectedValue(err);
    await expect(users.getUserProfile('u1')).rejects.toThrow('Server error');
  });

  it('updateUserProfile calls PATCH', async () => {
    client.apiPatch.mockResolvedValue({ data: { name: 'Updated' } });
    const result = await users.updateUserProfile({ name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('getPendingUserDocuments returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'd1' }] });
    const result = await users.getPendingUserDocuments();
    expect(result).toHaveLength(1);
  });

  it('getPendingUserDocuments handles missing data', async () => {
    client.apiGet.mockResolvedValue({});
    const result = await users.getPendingUserDocuments();
    expect(result).toEqual([]);
  });

  it('approveUserDocument calls POST', async () => {
    client.apiPost.mockResolvedValue({ data: { status: 'approved' } });
    await users.approveUserDocument('d1', 'Looks good');
    expect(client.apiPost).toHaveBeenCalledWith('/admin/user-documents/d1/approve', { note: 'Looks good' });
  });

  it('approveUserDocument without note', async () => {
    client.apiPost.mockResolvedValue({ data: { status: 'approved' } });
    await users.approveUserDocument('d1');
    expect(client.apiPost).toHaveBeenCalledWith('/admin/user-documents/d1/approve', {});
  });

  it('rejectUserDocument calls POST', async () => {
    client.apiPost.mockResolvedValue({ data: { status: 'rejected' } });
    await users.rejectUserDocument('d1', 'Bad doc');
    expect(client.apiPost).toHaveBeenCalledWith('/admin/user-documents/d1/reject', { note: 'Bad doc' });
  });

  it('getAuditLogs returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'l1' }] });
    const result = await users.getAuditLogs();
    expect(result).toHaveLength(1);
    expect(client.apiGet).toHaveBeenCalledWith('/admin/audit-logs?limit=100');
  });

  it('getAuditLogs with custom limit', async () => {
    client.apiGet.mockResolvedValue({ data: [] });
    await users.getAuditLogs({ limit: 50 });
    expect(client.apiGet).toHaveBeenCalledWith('/admin/audit-logs?limit=50');
  });
});
