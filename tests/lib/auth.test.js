import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  register,
  login,
  getSession,
  logout,
  getUserById,
  refreshAccessToken,
} from "../../lib/api/auth";

const mockFetchSuccess = (payload) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => payload,
  });
};

const mockFetchError = (payload) => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status: payload.status || 401,
    json: async () => ({ error: payload.error || "Unauthorized" }),
  });
};

describe("Auth API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers a new user with pending roles", async () => {
    mockFetchSuccess({
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        roles: [
          { roleName: "buyer", status: "pending" },
          { roleName: "seller", status: "pending" },
        ],
      },
    });

    const result = await register({
      name: "John Doe",
      email: "john@example.com",
      password: "TestPassword123",
      roles: ["buyer", "seller"],
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.user.id).toBe("user-1");
    expect(result.user.name).toBe("John Doe");
    expect(result.user.email).toBe("john@example.com");
    expect(result.user.roles).toEqual([
      { type: "buyer", status: "pending" },
      { type: "seller", status: "pending" },
    ]);
  });

  it("logs in with correct credentials", async () => {
    mockFetchSuccess({
      user: {
        id: "user-2",
        name: "Login Test",
        email: "login@example.com",
        roles: [
          { roleName: "buyer", status: "approved" },
          { roleName: "seller", status: "pending" },
        ],
      },
    });

    const result = await login({
      email: "login@example.com",
      password: "TestPassword123",
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.user.activeRole).toBe("buyer");
    expect(result.user.roles).toEqual([
      { type: "buyer", status: "approved" },
      { type: "seller", status: "pending" },
    ]);
  });

  it("rejects login with wrong password", async () => {
    mockFetchError({ error: "Invalid email or password" });

    await expect(
      login({
        email: "wrong@example.com",
        password: "WrongPassword",
      }),
    ).rejects.toThrow("Invalid email or password");
  });

  it("returns null session when auth cookie is missing", async () => {
    mockFetchError({ status: 401, error: "Unauthorized" });
    mockFetchError({ status: 401, error: "Unauthorized" });

    const session = await getSession();
    expect(session).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("clears session on logout", async () => {
    mockFetchSuccess({ success: true });

    await logout();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("getUserById returns null without valid token", async () => {
    mockFetchError({ status: 401, error: "Unauthorized" });

    const user = await getUserById("some-id");
    expect(user).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("refreshes access token using cookies only", async () => {
    mockFetchSuccess({ success: true });

    const result = await refreshAccessToken();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/refresh$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(result.success).toBe(true);
  });
});
