import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/api/auth', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn().mockResolvedValue(null),
  getUserById: vi.fn().mockResolvedValue(null),
  loginWithGoogle: vi.fn(),
  loginWithFacebook: vi.fn(),
  loginWithApple: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  default: { trackEvent: vi.fn() },
}));

import * as authAPI from '@/lib/api/auth';
import { AuthContext, AuthProvider } from '@/lib/auth/AuthContext.jsx';

function wrapper({ children }) {
  return React.createElement(AuthProvider, null, children);
}

describe('Auth Lifecycle — Production Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAPI.getSession.mockResolvedValue(null);
    authAPI.getUserById.mockResolvedValue(null);
  });

  describe('Registration', () => {
    it('registers a user', async () => {
      authAPI.register.mockResolvedValue({
        user: { id: 'u1', name: 'New User', email: 'new@test.com', roles: [] },
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.register({ name: 'New User', email: 'new@test.com', password: 'P@ssw0rd!', roles: ['client'] });
      });

      expect(authAPI.register).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New User', email: 'new@test.com', roles: ['client'] }),
      );
    });

    it('sets error on registration failure', async () => {
      authAPI.register.mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        try {
          await result.current.register({ name: 'X', email: 'exists@test.com', password: 'pw', roles: ['client'] });
        } catch {}
      });

      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Login', () => {
    it('logs in successfully', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'Test', email: 'test@test.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] },
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'test@test.com', password: 'pw' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.name).toBe('Test');
    });

    it('sets error on login failure', async () => {
      authAPI.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        try { await result.current.login({ email: 'bad', password: 'pw' }); } catch {}
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets loading=true during login and false after', async () => {
      let resolveLogin;
      authAPI.login.mockReturnValue(new Promise((r) => { resolveLogin = r; }));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      let loginPromise;
      act(() => {
        loginPromise = result.current.login({ email: 't@t.com', password: 'pw' }).catch(() => {});
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveLogin({ user: { id: 'u1', name: 'T', email: 't@t.com', activeRole: 'client', roles: [] } });
        await loginPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Role Switching', () => {
    it('switches to an approved role', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'Multi', email: 'm@t.com', activeRole: 'client', roles: [
          { type: 'client', status: 'approved' },
          { type: 'owner', status: 'approved' },
        ]},
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'm@t.com', password: 'pw' });
      });

      await act(async () => {
        result.current.switchRole('owner');
      });

      expect(result.current.user.activeRole).toBe('owner');
      expect(result.current.error).toBeNull();
    });

    it('rejects switching to pending role', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'Pending', email: 'p@t.com', activeRole: 'client', roles: [
          { type: 'client', status: 'approved' },
          { type: 'owner', status: 'pending' },
        ]},
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'p@t.com', password: 'pw' });
      });

      act(() => {
        result.current.switchRole('owner');
      });

      expect(result.current.user.activeRole).toBe('client');
      expect(result.current.error).toContain('not approved');
    });

    it('rejects switching to non-existent role', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'NoRole', email: 'n@t.com', activeRole: 'client', roles: [
          { type: 'client', status: 'approved' },
        ]},
      });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'n@t.com', password: 'pw' });
      });

      act(() => {
        result.current.switchRole('agent');
      });

      expect(result.current.error).toBe('Role not found');
    });
  });

  describe('Logout', () => {
    it('clears session and user on logout', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'Logout', email: 'lo@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] },
      });
      authAPI.logout.mockResolvedValue({ success: true });

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'lo@t.com', password: 'pw' });
      });
      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('sets error on logout failure', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'FL', email: 'fl@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] },
      });
      authAPI.logout.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => {
        await result.current.login({ email: 'fl@t.com', password: 'pw' });
      });

      await act(async () => {
        try { await result.current.logout(); } catch {}
      });

      expect(result.current.error).toBe('Network error');
    });
  });
});
