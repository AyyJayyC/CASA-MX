import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  usePathname: () => '/'
}));

import { AuthContext } from '../../lib/auth/AuthContext.jsx';
import NavBar from '../../components/NavBar.jsx';

describe('NavBar role-aware links', () => {
  it('shows login/register buttons when not authenticated', () => {
    const mockAuthValue = {
      isAuthenticated: false,
      user: null,
      loading: false,
      logout: vi.fn(),
      switchRole: vi.fn()
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NavBar />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
  });

  it('shows user info and logout button when authenticated', () => {
    const switchRole = vi.fn();
    const mockAuthValue = {
      isAuthenticated: true,
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        activeRole: 'seller',
        roles: [
          { type: 'seller', status: 'approved' },
          { type: 'buyer', status: 'pending' }
        ]
      },
      loading: false,
      logout: vi.fn(),
      switchRole
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NavBar />
      </AuthContext.Provider>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'buyer' } });
    expect(switchRole).toHaveBeenCalledWith('buyer');
  });
});
