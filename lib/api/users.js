/**
 * Users API (admin operations)
 * Purpose: Manage user roles and approvals.
 */

import { getItem, setItem } from '../storage/storage';

/**
 * Simulate latency
 */
function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get all users with pending roles
 * @returns {Promise<array>}
 */
export async function getPendingApprovals() {
  await delay(100);
  const users = getItem('users') || [];
  return users.filter((u) => u.roles.some((r) => r.status === 'pending'));
}

/**
 * Approve a user's role
 * @param {{userId, roleType}} payload
 * @returns {Promise<user>}
 */
export async function approveRole(payload) {
  await delay(200);
  const users = getItem('users') || [];
  const user = users.find((u) => u.id === payload.userId);

  if (!user) throw new Error('Usuario no encontrado');

  const role = user.roles.find((r) => r.type === payload.roleType);
  if (!role) throw new Error('Rol no encontrado');

  role.status = 'approved';
  setItem('users', users);

  return user;
}

/**
 * Reject a user's role
 * @param {{userId, roleType}} payload
 * @returns {Promise<user>}
 */
export async function rejectRole(payload) {
  await delay(200);
  const users = getItem('users') || [];
  const user = users.find((u) => u.id === payload.userId);

  if (!user) throw new Error('Usuario no encontrado');

  const role = user.roles.find((r) => r.type === payload.roleType);
  if (!role) throw new Error('Rol no encontrado');

  role.status = 'rejected';
  setItem('users', users);

  return user;
}

/**
 * Get user profile (current or by ID)
 * @param {string} userId
 * @returns {Promise<user>}
 */
export async function getUserProfile(userId) {
  await delay(100);
  const users = getItem('users') || [];
  return users.find((u) => u.id === userId) || null;
}
