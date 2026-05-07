const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function parseResponse(res, data, defaultError = 'Error de red') {
  if (!res.ok) {
    throw Object.assign(new Error(data?.error || data?.message || defaultError), { status: res.status, data });
  }
  return data;
}

export async function getNotifications() {
  const res = await fetch(`${BACKEND_URL}/notifications`, { credentials: 'include' });
  const data = await res.json();
  return parseResponse(res, data, 'Failed to fetch notifications').data;
}

export async function markNotificationRead(id) {
  const res = await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${BACKEND_URL}/notifications/read-all`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}
