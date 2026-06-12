import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
  apiFetch: vi.fn(),
  parseResponse: vi.fn(),
}));

import * as notifications from '@/lib/api/notifications';

describe('notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotifications returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: '1', title: 'Test' }] });
    const result = await notifications.getNotifications();
    expect(client.apiGet).toHaveBeenCalledWith('/notifications');
    expect(result).toEqual([{ id: '1', title: 'Test' }]);
  });

  it('markNotificationRead calls PATCH with correct path', async () => {
    client.apiPatch.mockResolvedValue({ success: true });
    await notifications.markNotificationRead('n1');
    expect(client.apiPatch).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('markAllNotificationsRead calls PATCH', async () => {
    client.apiPatch.mockResolvedValue({ success: true });
    await notifications.markAllNotificationsRead();
    expect(client.apiPatch).toHaveBeenCalledWith('/notifications/read-all');
  });
});
