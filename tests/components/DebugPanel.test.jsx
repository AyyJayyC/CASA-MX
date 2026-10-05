import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/logging/logger', () => ({
  logger: {
    getLogs: vi.fn(() => []),
    getStats: vi.fn(() => ({ totalLogs: 0, byLevel: {} })),
    exportLogs: vi.fn(),
    exportLogsCSV: vi.fn(),
    clearLogs: vi.fn(),
  },
}));

const useAuthMock = vi.fn();
vi.mock('@/lib/auth/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

import DebugPanel from '../../components/DebugPanel.jsx';

describe('DebugPanel', () => {
  it('does not render for non-admin users', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isHydrated: true,
      user: {
        roles: [{ type: 'client', status: 'approved' }],
      },
    });

    const { container } = render(<DebugPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders for approved admins in non-production', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isHydrated: true,
      user: {
        roles: [{ type: 'admin', status: 'approved' }],
      },
    });

    render(<DebugPanel />);
    expect(screen.getByRole('button', { name: /Debug \(0\)/i })).toBeInTheDocument();
  });
});
