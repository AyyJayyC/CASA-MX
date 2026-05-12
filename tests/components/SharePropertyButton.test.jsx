import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SharePropertyButton from '../../components/SharePropertyButton.jsx';

const mockTrackClick = vi.fn();
const mockGetCode = vi.fn();

vi.mock('../../lib/api/referrals', () => ({
  getMyReferralCode: (...args) => mockGetCode(...args),
  trackReferralClick: (...args) => mockTrackClick(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ user: { referralCode: 'USR001' } }),
  default: () => ({ user: { referralCode: 'USR001' } }),
}));

describe('SharePropertyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue() },
    });
    globalThis.open = vi.fn();
  });

  it('renders the share button', () => {
    render(<SharePropertyButton propertyId="prop-1" propertyTitle="Casa bonita" />);
    expect(screen.getByText('Compartir')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<SharePropertyButton propertyId="prop-1" propertyTitle="Casa bonita" />);
    fireEvent.click(screen.getByText('Compartir'));
    await waitFor(() => {
      expect(screen.getByText('Compartir por WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Copiar enlace')).toBeInTheDocument();
    });
  });

  it('copies link to clipboard and tracks click', async () => {
    render(<SharePropertyButton propertyId="prop-1" propertyTitle="Casa bonita" />);
    fireEvent.click(screen.getByText('Compartir'));
    await waitFor(() => expect(screen.getByText('Copiar enlace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Copiar enlace'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockTrackClick).toHaveBeenCalledWith({ referralCode: 'USR001', propertyId: 'prop-1' });
    });
  });

  it('shows "¡Enlace copiado!" on the button after copying', async () => {
    render(<SharePropertyButton propertyId="prop-1" propertyTitle="Casa bonita" />);
    fireEvent.click(screen.getByText('Compartir'));
    await waitFor(() => expect(screen.getByText('Copiar enlace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Copiar enlace'));

    await waitFor(() => {
      expect(screen.getByText('¡Enlace copiado!')).toBeInTheDocument();
    });
  });

  it('opens WhatsApp link on WhatsApp click', async () => {
    render(<SharePropertyButton propertyId="prop-1" propertyTitle="Casa bonita" />);
    fireEvent.click(screen.getByText('Compartir'));
    await waitFor(() => expect(screen.getByText('Compartir por WhatsApp')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Compartir por WhatsApp'));

    await waitFor(() => {
      expect(globalThis.open).toHaveBeenCalled();
      const url = globalThis.open.mock.calls[0][0];
      expect(url).toContain('wa.me');
      expect(url).toContain('USR001');
    });
  });
});
