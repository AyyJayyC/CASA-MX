const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getNotifications() {
  const res = await fetch(`${BACKEND_URL}/notifications`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const json = await res.json();
  return json.data; // { notifications, unreadCount }
}

export async function markNotificationRead(id) {
  await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
}

export async function markAllNotificationsRead() {
  await fetch(`${BACKEND_URL}/notifications/read-all`, {
    method: 'PATCH',
    credentials: 'include',
  });
}
