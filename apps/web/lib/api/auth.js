/**
 * Authentication API (real backend integration)
 * Purpose: Handle login, register, logout via HTTP to backend from env config
 */

import { getCsrfToken } from "./csrf";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function csrfHeaders(base = {}) {
  const token = getCsrfToken();
  return token ? { ...base, "x-csrf-token": token } : base;
}

async function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: csrfHeaders(
      options.headers || { "Content-Type": "application/json" },
    ),
    credentials: "include",
  });
}

/**
 * Register a new user with roles (pending approval)
 * @param {{name, email, password}} payload
 * @returns {Promise<{user: {id, name, email, roles}}>}
 */
export async function register(payload) {
  let ref = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("casa-mx:1.0.0:referralCode");
      if (raw) ref = JSON.parse(raw);
      if (!ref) {
        const agencyRaw = localStorage.getItem("casa-mx:1.0.0:agencyCode");
        if (agencyRaw) ref = JSON.parse(agencyRaw);
      }
    } catch {}
  }

  const body = ref ? { ...payload, ref } : payload;

  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  // Clear stored referral/agency code after successful registration
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("casa-mx:1.0.0:referralCode");
      localStorage.removeItem("casa-mx:1.0.0:agencyCode");
    } catch {}
  }

  const data = await response.json();
  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      referralCode: data.user.referralCode,
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();

  const roles = (data.user.roles || []).map((r) => ({
    type: r.roleName,
    status: r.status,
  }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatarUrl: data.user.avatarUrl || null,
      emailVerified: Boolean(data.user.emailVerified),
      officialIdUploaded: Boolean(data.user.officialIdUploaded),
      officialIdVerified: Boolean(data.user.officialIdVerified),
      paidSubscriber: Boolean(data.user.paidSubscriber),
      subscriptionStatus: data.user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd:
        data.user.subscriptionCurrentPeriodEnd || null,
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
    method: "POST",
    headers: csrfHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

/**
 * Get current session from auth cookie
 * @returns {Promise<{userId, email, name, activeRole, roles} | null>}
 */
export async function getSession() {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    let response = await authFetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.status === 401) {
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed?.success) {
          response = await authFetch(`${BACKEND_URL}/auth/me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
        }
      } catch {}
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user;

    const rolesArray = user.roles || user.userRoles || [];
    const roles = rolesArray.map((r) => ({
      type: r.roleName || r.role?.name || r.type,
      status: r.status || "approved",
    }));

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      officialIdUploaded: Boolean(user.officialIdUploaded),
      officialIdVerified: Boolean(user.officialIdVerified),
      paidSubscriber: Boolean(user.paidSubscriber),
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd || null,
      activeRole: roles.length > 0 ? roles[0].type : null,
      roles,
      agency: user.agency || null,
      ownedAgency: user.ownedAgency || null,
    };
  } catch (err) {
    console.error("Failed to get session:", err);
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
    const response = await authFetch(`${BACKEND_URL}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data.data || data.user;

    if (!user) return null;

    const rolesArray = user.roles || user.userRoles || [];
    const roles = rolesArray.map((r) => ({
      type: r.roleName || r.role?.name || r.type,
      status: r.status || "approved",
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      emailVerified: Boolean(user.emailVerified),
      officialIdUploaded: Boolean(user.officialIdUploaded),
      officialIdVerified: Boolean(user.officialIdVerified),
      paidSubscriber: Boolean(user.paidSubscriber),
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd || null,
      roles,
      activeRole: roles.length > 0 ? roles[0].type : null,
    };
  } catch (err) {
    console.error("Failed to get user:", err);
    return null;
  }
}

/**
 * Login with Google ID token (OAuth)
 * @param {string} idToken — Google credential from GSI
 * @returns {Promise<{user}>}
 */
export async function loginWithGoogle(idToken) {
  const response = await authFetch(`${BACKEND_URL}/auth/oauth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Google login failed");
  }

  const data = await response.json();
  const userRoles = (data.user.roles || []).map((r) => ({
    type: r.roleName,
    status: r.status,
  }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      officialIdUploaded: Boolean(data.user.officialIdUploaded),
      officialIdVerified: Boolean(data.user.officialIdVerified),
      paidSubscriber: Boolean(data.user.paidSubscriber),
      subscriptionStatus: data.user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd:
        data.user.subscriptionCurrentPeriodEnd || null,
      avatarUrl: data.user.avatarUrl,
      provider: data.user.provider,
      roles: userRoles,
      activeRole: userRoles.length > 0 ? userRoles[0].type : null,
    },
  };
}

/**
 * Login with Facebook access token
 * @param {string} accessToken — Facebook access token from FB SDK
 * @returns {Promise<{user}>}
 */
export async function loginWithFacebook(accessToken) {
  const response = await authFetch(`${BACKEND_URL}/auth/oauth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Facebook login failed");
  }

  const data = await response.json();
  const userRoles = (data.user.roles || []).map((r) => ({
    type: r.roleName,
    status: r.status,
  }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      officialIdUploaded: Boolean(data.user.officialIdUploaded),
      officialIdVerified: Boolean(data.user.officialIdVerified),
      paidSubscriber: Boolean(data.user.paidSubscriber),
      subscriptionStatus: data.user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd:
        data.user.subscriptionCurrentPeriodEnd || null,
      avatarUrl: data.user.avatarUrl,
      provider: data.user.provider,
      roles: userRoles,
      activeRole: userRoles.length > 0 ? userRoles[0].type : null,
    },
  };
}

/**
 * Login with Apple identity token + authorization code
 * @param {string} identityToken — Apple identity token from Apple JS
 * @param {string} authorizationCode — Apple authorization code from Apple JS
 * @param {string} [name] — User's display name (Apple only sends on first sign-in)
 * @returns {Promise<{user}>}
 */
export async function loginWithApple(identityToken, authorizationCode, name) {
  const response = await authFetch(`${BACKEND_URL}/auth/oauth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      identityToken,
      authorizationCode,
      name: name || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Apple login failed");
  }

  const data = await response.json();
  const userRoles = (data.user.roles || []).map((r) => ({
    type: r.roleName,
    status: r.status,
  }));

  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: Boolean(data.user.emailVerified),
      officialIdUploaded: Boolean(data.user.officialIdUploaded),
      officialIdVerified: Boolean(data.user.officialIdVerified),
      paidSubscriber: Boolean(data.user.paidSubscriber),
      subscriptionStatus: data.user.subscriptionStatus || "inactive",
      subscriptionCurrentPeriodEnd:
        data.user.subscriptionCurrentPeriodEnd || null,
      avatarUrl: data.user.avatarUrl,
      provider: data.user.provider,
      roles: userRoles,
      activeRole: userRoles.length > 0 ? userRoles[0].type : null,
    },
  };
}

/**
 * Request a password reset email
 * @param {{email}} payload
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function forgotPassword(payload) {
  const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to request password reset");
  }

  return response.json();
}

/**
 * Reset password with token
 * @param {{token, password}} payload
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetPassword(payload) {
  const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }

  return response.json();
}

/**
 * Get all users (admin only)
 * @returns {Promise<array>}
 */
export async function getAllUsers() {
  try {
    const response = await authFetch(`${BACKEND_URL}/admin/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Failed to get users:", err);
    return [];
  }
}
