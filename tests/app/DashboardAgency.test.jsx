import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AgencyPage from '../../app/dashboard/agency/page.jsx';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard/agency',
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetAgency = vi.fn();
const mockGetAgents = vi.fn();
const mockGetAgencyMembership = vi.fn();
const mockGetAgencyPricing = vi.fn();

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => React.createElement('a', { 'data-href': href, ...props }, children),
}));

vi.mock('../../lib/api/agencies', () => ({
  getMyAgency: (...args) => mockGetAgency(...args),
  getMyAgents: (...args) => mockGetAgents(...args),
  getMyAgencyMembership: (...args) => mockGetAgencyMembership(...args),
  getAgencyPricing: (...args) => mockGetAgencyPricing(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u-1', roles: [{ type: 'seller', status: 'approved' }, { type: 'admin', status: 'approved' }], activeRole: 'seller' }, isAuthenticated: true, isHydrated: true, loading: false }),
  default: () => ({ user: { id: 'u-1', roles: [{ type: 'seller', status: 'approved' }], activeRole: 'seller' }, isAuthenticated: true, isHydrated: true, loading: false }),
}));

const mockAgency = {
  id: 'a-1',
  name: 'Grupo Inmobiliario MX',
  legalName: 'Grupo Inmobiliario MX S.A. de C.V.',
  rfc: 'GIM123456XYZ',
  referralCode: 'AG001',
  billingActive: true,
  plan: 'pro',
  agentLimit: 5,
  _count: { members: 3 },
};

const mockAgentsData = {
  agents: [
    { id: 'u-2', name: 'Juan Pérez', email: 'juan@agencia.com', createdAt: '2026-04-01T00:00:00.000Z', roles: ['seller'] },
    { id: 'u-3', name: 'María López', email: 'maria@agencia.com', createdAt: '2026-04-15T00:00:00.000Z', roles: ['landlord'] },
  ],
  total: 2,
  agentLimit: 5,
};

const mockPricing = {
  planPrice: 1999,
  plans: [
    { name: 'basico', label: 'Básico', price: 999, agents: 3, leads: 50 },
    { name: 'pro', label: 'Pro', price: 1999, agents: 10, leads: 100 },
    { name: 'empresarial', label: 'Empresarial', price: 3999, agents: 30, leads: 300 },
  ],
  extraAgentCost: 200,
};

describe('DashboardAgencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAgency.mockResolvedValue(mockAgency);
    mockGetAgents.mockResolvedValue(mockAgentsData);
    mockGetAgencyMembership.mockResolvedValue(null);
    mockGetAgencyPricing.mockResolvedValue(mockPricing);
  });

  it('renders the agency name', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText('Grupo Inmobiliario MX')).toBeInTheDocument();
    });
  });

  it('shows the plan status and agent count', async () => {
    render(<AgencyPage />);
    await waitFor(() => {
      expect(screen.getByText('Activo')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText(/Agentes: 3 \/ 5/)).toBeInTheDocument();
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
      expect(screen.getByText(/Quieres registrar tu agencia/i)).toBeInTheDocument();
    });
  });
});
