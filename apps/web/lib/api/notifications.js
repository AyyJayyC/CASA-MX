import { apiGet, apiPatch } from "./client";

export async function getNotifications() {
  return (await apiGet("/notifications")).data;
}

export async function markNotificationRead(id) {
  const res = await apiPatch(`/notifications/${id}/read`);
  return res;
}

export async function markAllNotificationsRead() {
  const res = await apiPatch("/notifications/read-all");
  return res;
}
