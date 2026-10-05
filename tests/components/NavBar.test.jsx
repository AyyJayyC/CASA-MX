import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthContext } from '../../lib/auth/AuthContext.jsx';
import NavBar from '../../components/NavBar.jsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

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
      </AuthContext.Provider>,
      { wrapper: Wrapper }
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
        activeRole: 'owner',
        roles: [
          { type: 'owner', status: 'approved' },
          { type: 'client', status: 'pending' }
        ]
      },
      loading: false,
      logout: vi.fn(),
      switchRole
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NavBar />
      </AuthContext.Provider>,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Salir')).toBeInTheDocument();
  });
});
