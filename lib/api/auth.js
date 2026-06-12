import { apiPost, apiGet } from "./client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function parseUser(user) {
  if (!user) return user;
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
    phoneVerified: Boolean(user.phoneVerified),
    officialIdUploaded: Boolean(user.officialIdUploaded),
    officialIdVerified: Boolean(user.officialIdVerified),
    paidSubscriber: Boolean(user.paidSubscriber),
    subscriptionStatus: user.subscriptionStatus || "inactive",
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd || null,
    provider: user.provider || null,
    roles,
    activeRole: roles.length > 0 ? roles[0].type : null,
    agency: user.agency || null,
    ownedAgency: user.ownedAgency || null,
    referralCode: user.referralCode || null,
  };
}

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

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("casa-mx:1.0.0:referralCode");
      localStorage.removeItem("casa-mx:1.0.0:agencyCode");
    } catch {}
  }

  const data = await response.json();
  return { user: parseUser(data.user) };
}

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
  return { user: parseUser(data.user) };
}

export async function refreshAccessToken() {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error("Token refresh failed");
    return response.json();
  } catch {
    return { success: false };
  }
}

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

export async function getSession() {
  try {
    if (typeof window === "undefined") return null;

    let response = await fetch("/api/auth/me");
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed?.success) {
        response = await fetch("/api/auth/me");
      }
    }

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.user) return null;

    const user = parseUser(data.user);
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      officialIdUploaded: user.officialIdUploaded,
      officialIdVerified: user.officialIdVerified,
      paidSubscriber: user.paidSubscriber,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      activeRole: user.activeRole,
      roles: user.roles,
      agency: user.agency,
      ownedAgency: user.ownedAgency,
    };
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, { credentials: "include" });
    if (!response.ok) return null;
    const data = await response.json();
    return parseUser(data.data || data.user);
  } catch {
    return null;
  }
}

async function oauthLogin(provider, body) {
  const data = await apiPost(`/auth/oauth/${provider}`, body);
  return { user: parseUser(data.user) };
}

export async function loginWithGoogle(idToken) {
  return oauthLogin("google", { idToken });
}

export async function loginWithFacebook(accessToken) {
  return oauthLogin("facebook", { accessToken });
}

export async function loginWithApple(identityToken, authorizationCode, name) {
  return oauthLogin("apple", { identityToken, authorizationCode, name: name || undefined });
}

export async function forgotPassword(payload) {
  return apiPost("/auth/forgot-password", payload);
}

export async function resetPassword(payload) {
  return apiPost("/auth/reset-password", payload);
}

export async function getAllUsers() {
  try {
    return (await apiGet("/admin/users")).data || [];
  } catch {
    return [];
  }
}
