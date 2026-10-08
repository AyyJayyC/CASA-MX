import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReferredLeadsPage from '../../app/dashboard/leads/page.jsx';

const mockGetReferredLeads = vi.fn();

vi.mock('../../lib/api/leads', () => ({
  getReferredLeads: (...args) => mockGetReferredLeads(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'agent-1', name: 'Agent One', activeRole: 'agent' },
    isAuthenticated: true,
  }),
  default: () => ({
    user: { id: 'agent-1', name: 'Agent One', activeRole: 'agent' },
    isAuthenticated: true,
  }),
}));

const LEADS = {
  offers: [
    {
      id: 'offer-1',
      buyerName: 'Buyer One',
      buyerEmail: 'buyer1@example.com',
      buyerPhone: '5511112222',
      offerAmount: 950000,
      property: { id: 'prop-1', title: 'Casa Referida' },
      capturingAgent: { id: 'seller-1', name: 'Capturing Agent', whatsapp: '+525511112222' },
    },
  ],
  requests: [
    {
      id: 'req-1',
      name: 'Buyer Two',
      phone: '5533334444',
      property: { id: 'prop-2', title: 'Depto Referido' },
      capturingAgent: { id: 'seller-2', name: 'Other Agent', whatsapp: null, phone: '5599998888' },
    },
  ],
};

describe('ReferredLeadsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReferredLeads.mockResolvedValue(LEADS);
  });

  it('renders the page title', async () => {
    render(<ReferredLeadsPage />);
    await waitFor(() => {
      expect(screen.getByText('Leads referidos')).toBeInTheDocument();
    });
  });

  it("shows the referring agent the buyer's contact", async () => {
    render(<ReferredLeadsPage />);
    await waitFor(() => {
      expect(screen.getByText(/buyer1@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/5533334444/)).toBeInTheDocument();
    });
  });

  it('offers a WhatsApp deep link to the capturing agent', async () => {
    render(<ReferredLeadsPage />);
    const links = await screen.findAllByRole('link', {
      name: /Contactar por WhatsApp/i,
    });
    expect(links[0].getAttribute('href')).toContain('wa.me');
    expect(links[0].getAttribute('href')).toContain('525511112222');
  });

  it('shows an empty state when there are no referred leads', async () => {
    mockGetReferredLeads.mockResolvedValue({ offers: [], requests: [] });
    render(<ReferredLeadsPage />);
    await waitFor(() => {
      expect(screen.getByText(/no tienes leads referidos/i)).toBeInTheDocument();
    });
  });
});
