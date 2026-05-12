import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AgencyPage from '../../app/dashboard/agency/page.jsx';

const mockGetAgency = vi.fn();
const mockGetAgents = vi.fn();

vi.mock('../../lib/api/agencies', () => ({
  getMyAgency: (...args) => mockGetAgency(...args),
  getMyAgents: (...args) => mockGetAgents(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u-1' }, isAuthenticated: true }),
  default: () => ({ user: { id: 'u-1' }, isAuthenticated: true }),
}));

const mockAgency = {
  id: 'a-1',
  name: 'Grupo Inmobiliario MX',
  legalName: 'Grupo Inmobiliario MX S.A. de C.V.',
  rfc: 'GIM123456XYZ',
  referralCode: 'AG001',
  _count: { members: 3 },
};

describe('DashboardAgencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAgency.mockResolvedValue(mockAgency);
    mockGetAgents.mockResolvedValue([
      { id: 'u-2', name: 'Juan Pérez', email: 'juan@agencia.com', createdAt: '2026-04-01T00:00:00.000Z', roles: ['seller'] },
      { id: 'u-3', name: 'María López', email: 'maria@agencia.com', createdAt: '2026-04-15T00:00:00.000Z', roles: ['landlord'] },
    ]);
  });

  it('renders the agency name', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      const matches = screen.getAllByText('Grupo Inmobiliario MX');
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows agency legal name and RFC', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText('Grupo Inmobiliario MX S.A. de C.V.')).toBeInTheDocument();
      expect(screen.getByText('GIM123456XYZ')).toBeInTheDocument();
    });
  });

  it('shows the referral code for inviting agents', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText('AG001')).toBeInTheDocument();
    });
  });

  it('shows agent list', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María López')).toBeInTheDocument();
    });
  });

  it('shows empty state when no agency', async () => {
    mockGetAgency.mockResolvedValue(null);

    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText(/No tienes una agencia/i)).toBeInTheDocument();
    });
  });

});
