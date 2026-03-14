/**
 * Tests for Auth API client behavior
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { register, login, getSession, logout, getUserById } from '../../lib/api/auth';

describe('Auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers a new user with pending roles', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          roles: [
            { roleName: 'buyer', status: 'pending' },
            { roleName: 'seller', status: 'pending' },
          ],
        },
      }),
    });

    const result = await register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'TestPassword123',
      roles: ['buyer', 'seller'],
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      roles: [
        { type: 'buyer', status: 'pending' },
        { type: 'seller', status: 'pending' },
      ],
    });
  });

  it('logs in with correct credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'user-2',
          name: 'Login Test',
          email: 'login@example.com',
          roles: [
            { roleName: 'buyer', status: 'approved' },
            { roleName: 'seller', status: 'pending' },
          ],
        },
        token: 'access-token',
        refreshToken: 'refresh-token',
      }),
    });

    const result = await login({
      email: 'login@example.com',
      password: 'TestPassword123',
    });

    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    expect(result.user.activeRole).toBe('buyer');
    expect(result.user.roles).toEqual([{ type: 'buyer', status: 'approved' }]);
  });

  it('rejects login with wrong password', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid email or password' }),
    });

    await expect(
      login({
        email: 'wrong@example.com',
        password: 'WrongPassword',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('returns null session when no token', async () => {
    const session = await getSession();
    expect(session).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('clears session on logout', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    localStorage.setItem('accessToken', 'fake-token');
    localStorage.setItem('refreshToken', 'fake-refresh-token');

    await logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('getUserById returns null without valid token', async () => {
    const user = await getUserById('some-id');
    expect(user).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
