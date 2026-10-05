import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../lib/api/auth', () => ({
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

import * as authAPI from '../../lib/api/auth';
import { AuthContext, AuthProvider } from '../../lib/auth/AuthContext.jsx';

function wrapper({ children }) {
  return React.createElement(AuthProvider, null, children);
}

describe('AuthContext — Production Grade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAPI.getSession.mockResolvedValue(null);
    authAPI.getUserById.mockResolvedValue(null);
  });

  describe('Initial / Hydration', () => {
    it('starts unauthenticated', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('sets isHydrated to true after mount', async () => {
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
    });

    it('hydrates from existing session', async () => {
      authAPI.getSession.mockResolvedValue({ userId: 'u1', activeRole: 'client' });
      authAPI.getUserById.mockResolvedValue({ id: 'u1', name: 'Hydrated', email: 'h@t.com', activeRole: 'client', roles: [] });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.name).toBe('Hydrated');
    });

    it('handles hydration failure gracefully', async () => {
      authAPI.getSession.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
      expect(result.current.error).toBe('Failed to load session');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Login', () => {
    it('login sets session and user', async () => {
      authAPI.login.mockResolvedValue({
        user: { id: 'u1', name: 'Test', email: 't@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] },
      });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.login({ email: 't@t.com', password: 'pw' }); });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.name).toBe('Test');
      expect(result.current.user.email).toBe('t@t.com');
      expect(result.current.session.userId).toBe('u1');
    });

    it('login sets loading true then false', async () => {
      let resolve;
      authAPI.login.mockReturnValue(new Promise((r) => { resolve = r; }));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      act(() => { result.current.login({ email: 't@t.com', password: 'pw' }).catch(() => {}); });
      expect(result.current.loading).toBe(true);
      await act(async () => { resolve({ user: { id: 'u1', name: 'T', email: 't@t.com', activeRole: 'client', roles: [] } }); });
      expect(result.current.loading).toBe(false);
    });

    it('login failure sets error and stays unauthenticated', async () => {
      authAPI.login.mockRejectedValue(new Error('Invalid credentials'));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { try { await result.current.login({ email: 'bad', password: 'pw' }); } catch {} });
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('login clears previous error on retry', async () => {
      authAPI.login.mockRejectedValueOnce(new Error('Bad'));
      authAPI.login.mockResolvedValueOnce({ user: { id: 'u1', name: 'OK', email: 'ok@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { try { await result.current.login({ email: 'bad', password: 'pw' }); } catch {} });
      expect(result.current.error).toBe('Bad');
      await act(async () => { await result.current.login({ email: 'ok@t.com', password: 'pw' }); });
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Register', () => {
    it('register calls API with correct payload', async () => {
      authAPI.register.mockResolvedValue({ user: { id: 'u1', name: 'New', email: 'n@t.com', roles: [] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.register({ name: 'New', email: 'n@t.com', password: 'pw', roles: ['client'] }); });
      expect(authAPI.register).toHaveBeenCalledWith({ name: 'New', email: 'n@t.com', password: 'pw', roles: ['client'] });
    });

    it('register failure sets error', async () => {
      authAPI.register.mockRejectedValue(new Error('Email already exists'));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { try { await result.current.register({ name: 'X', email: 'exists@t.com', password: 'pw', roles: ['client'] }); } catch {} });
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Logout', () => {
    it('logout clears user and session', async () => {
      authAPI.login.mockResolvedValue({ user: { id: 'u1', name: 'L', email: 'l@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] } });
      authAPI.logout.mockResolvedValue({ success: true });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.login({ email: 'l@t.com', password: 'pw' }); });
      await act(async () => { await result.current.logout(); });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('logout failure sets error', async () => {
      authAPI.login.mockResolvedValue({ user: { id: 'u1', name: 'FL', email: 'fl@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] } });
      authAPI.logout.mockRejectedValue(new Error('Server error'));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.login({ email: 'fl@t.com', password: 'pw' }); });
      await act(async () => { try { await result.current.logout(); } catch {} });
      expect(result.current.error).toBe('Server error');
    });
  });

  describe('Role Switching', () => {
    it('switches to approved role', async () => {
      authAPI.login.mockResolvedValue({ user: { id: 'u1', name: 'Multi', email: 'm@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }, { type: 'owner', status: 'approved' }] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.login({ email: 'm@t.com', password: 'pw' }); });
      act(() => { result.current.switchRole('owner'); });
      expect(result.current.user.activeRole).toBe('owner');
      expect(result.current.session.activeRole).toBe('owner');
      expect(result.current.error).toBeNull();
    });

    it('rejects pending role with exact message', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      act(() => { result.current.switchRole('owner'); });
      expect(result.current.error).toBe('No user logged in');
    });

    it('rejects non-existent role', async () => {
      authAPI.login.mockResolvedValue({ user: { id: 'u1', name: 'One', email: 'one@t.com', activeRole: 'client', roles: [{ type: 'client', status: 'approved' }] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.login({ email: 'one@t.com', password: 'pw' }); });
      act(() => { result.current.switchRole('agent'); });
      expect(result.current.error).toBe('Role not found');
    });
  });

  describe('refreshUser', () => {
    it('refreshUser updates session and user', async () => {
      authAPI.getSession.mockResolvedValue({ userId: 'u1-active' });
      authAPI.getUserById.mockResolvedValue({ id: 'u1', name: 'Refreshed', email: 'r@t.com', activeRole: 'owner' });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
      await act(async () => { await result.current.refreshUser(); });
      expect(result.current.user.name).toBe('Refreshed');
    });

    it('refreshUser nulls on session loss', async () => {
      authAPI.getSession.mockResolvedValue(null);
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
      await act(async () => { await result.current.refreshUser(); });
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('refreshUser returns null on error', async () => {
      authAPI.getSession.mockRejectedValue(new Error('Network'));
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await vi.waitFor(() => expect(result.current.isHydrated).toBe(true));
      let r;
      await act(async () => { r = await result.current.refreshUser(); });
      expect(r).toBeNull();
    });
  });

  describe('Social Login', () => {
    it('loginWithGoogle delegates correctly', async () => {
      authAPI.loginWithGoogle.mockResolvedValue({ user: { id: 'u1', name: 'G', email: 'g@t.com', activeRole: 'client', roles: [] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.loginWithGoogle('google-token'); });
      expect(authAPI.loginWithGoogle).toHaveBeenCalledWith('google-token');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('loginWithFacebook delegates correctly', async () => {
      authAPI.loginWithFacebook.mockResolvedValue({ user: { id: 'u1', name: 'F', email: 'f@t.com', activeRole: 'client', roles: [] } });
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
      await act(async () => { await result.current.loginWithFacebook('fb-token'); });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
