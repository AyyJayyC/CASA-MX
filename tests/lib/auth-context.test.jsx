import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as authAPI from '../../lib/api/auth';
import { AuthContext, AuthProvider } from '../../lib/auth/AuthContext.jsx';

vi.mock('../../lib/api/auth', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getSession: vi.fn().mockResolvedValue(null),
  getUserById: vi.fn().mockResolvedValue(null),
}));

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  it('switches active role locally without re-authenticating', async () => {
    authAPI.login.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Preview Seller',
        email: 'preview-seller@casamx.local',
        activeRole: 'seller',
        roles: [
          { type: 'seller', status: 'approved' },
          { type: 'landlord', status: 'approved' },
        ],
      },
      token: 'access-token',
      refreshToken: 'refresh-token',
    });

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'preview-seller@casamx.local',
        password: 'CasaMxPreview!2026',
      });
    });

    expect(authAPI.login).toHaveBeenCalledTimes(1);
    expect(result.current.user.activeRole).toBe('seller');

    await act(async () => {
      await result.current.switchRole('landlord');
    });

    expect(authAPI.login).toHaveBeenCalledTimes(1);
    expect(result.current.user.activeRole).toBe('landlord');
    expect(result.current.session.activeRole).toBe('landlord');
  });
});