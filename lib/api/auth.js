/**
 * Authentication API (real backend integration)
 * Purpose: Handle login, register, logout via HTTP to backend from env config
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Register a new user with roles (pending approval)
 * @param {{name, email, password}} payload
 * @returns {Promise<{user: {id, name, email, roles}}>}
 */
export async function register(payload) {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      roles: (data.user.roles || []).map((r) => ({
        type: r.roleName,
        status: r.status,
      })),
    },
  };
}

/**
 * Login with email and password
 * @param {{email, password}} payload
 * @returns {Promise<{user: {id, name, email, roles, activeRole}}>} 
 */
export async function login(payload) {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();

  const roles = (data.user.roles || [])
    .filter((r) => r.status === 'approved')
    .map((r) => ({
      type: r.roleName,
      status: r.status,
    }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      roles,
      activeRole: roles.length > 0 ? roles[0].type : null,
    },
  };
}

/**
 * Refresh access token via httpOnly refresh cookie
 */
export async function refreshAccessToken() {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
  } catch (err) {
    console.error('Logout failed:', err);
  }
}

/**
 * Get current session from auth cookie
 * @returns {Promise<{userId, email, name, activeRole, roles} | null>}
 */
export async function getSession() {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    let response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.status === 401) {
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed?.success) {
          response = await fetch(`${BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
        }
      } catch {
      }
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user;

    const rolesArray = user.roles || user.userRoles || [];
    const roles = rolesArray
      .filter((r) => (r.status === 'approved' || !r.status))
      .map((r) => ({
        type: r.roleName || r.role?.name || r.type,
        status: r.status || 'approved',
      }));

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: Boolean(user.emailVerified),
      activeRole: roles.length > 0 ? roles[0].type : null,
      roles,
    };
  } catch (err) {
    console.error('Failed to get session:', err);
    return null;
  }
}

/**
 * Get user by ID
 * @param {string} userId
 * @returns {Promise<{id, name, email, roles, activeRole}>}
 */
export async function getUserById(userId) {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data.user;

    const rolesArray = user.roles || user.userRoles || [];
    const roles = rolesArray
      .filter((r) => (r.status === 'approved' || !r.status))
      .map((r) => ({
        type: r.roleName || r.role?.name || r.type,
        status: r.status || 'approved',
      }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      roles,
      activeRole: roles.length > 0 ? roles[0].type : null,
    };
  } catch (err) {
    console.error('Failed to get user:', err);
    return null;
  }
}

/**
 * Login with Google ID token (OAuth)
 * @param {string} idToken — Google credential from GSI
 * @returns {Promise<{user}>}
 */
export async function loginWithGoogle(idToken) {
  const response = await fetch(`${BACKEND_URL}/auth/oauth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Google login failed');
  }

  const data = await response.json();
  const userRoles = (data.user.roles || [])
    .filter((r) => r.status === 'approved')
    .map((r) => ({ type: r.roleName, status: r.status }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      avatarUrl: data.user.avatarUrl,
      provider: data.user.provider,
      roles: userRoles,
      activeRole: userRoles.length > 0 ? userRoles[0].type : null,
    },
  };
}

/**
 * Get all users (admin only)
 * @returns {Promise<array>}
 */
export async function getAllUsers() {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Failed to get users:', err);
    return [];
  }
}
