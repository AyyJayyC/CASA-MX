import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SharedPage from '../../app/dashboard/shared/page.jsx';

const mockGetCode = vi.fn();
const mockGetStats = vi.fn();

vi.mock('../../lib/api/referrals', () => ({
  getMyReferralCode: (...args) => mockGetCode(...args),
  getReferralStats: (...args) => mockGetStats(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ user: { referralCode: 'USR001' }, isAuthenticated: true }),
  default: () => ({ user: { referralCode: 'USR001' }, isAuthenticated: true }),
}));

describe('DashboardSharedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCode.mockResolvedValue('USR001');
    mockGetStats.mockResolvedValue({
      clicks: 25,
      signups: 3,
      conversionRate: 12,
      recentEvents: [
        { type: 'click', propertyId: 'prop-1', createdAt: '2026-05-12T10:00:00.000Z' },
        { type: 'signup', propertyId: null, createdAt: '2026-05-11T15:00:00.000Z' },
      ],
    });
  });

  it('renders the page title', async () => {
    render(<SharedPage />);
    await waitFor(() => {
      expect(screen.getByText('Enlaces compartidos')).toBeInTheDocument();
    });
  });

  it('shows the referral code', async () => {
    render(<SharedPage />);
    await waitFor(() => {
      expect(screen.getByText('USR001')).toBeInTheDocument();
    });
  });

  it('shows stats from the API', async () => {
    render(<SharedPage />);
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('12%')).toBeInTheDocument();
    });
  });

  it('shows recent activity events', async () => {
    render(<SharedPage />);
    await waitFor(() => {
      expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
      expect(screen.getByText(/prop-1/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no stats', async () => {
    mockGetStats.mockResolvedValue({ clicks: 0, signups: 0, conversionRate: 0, recentEvents: [] });

    render(<SharedPage />);
    await waitFor(() => {
      expect(screen.getByText(/aún no has compartido ninguna propiedad/i)).toBeInTheDocument();
    });
  });
});
