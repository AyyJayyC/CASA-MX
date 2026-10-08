import React from 'react';
import { render, screen } from '@testing-library/react';
import SellerContactRequests from '../../components/SellerContactRequests.jsx';
import * as requestQueries from '../../lib/queries/requests';
import * as creditQueries from '../../lib/queries/credits';

vi.mock('../../lib/queries/credits', () => ({
  useSpendCredit: () => ({ mutateAsync: vi.fn() }),
  useCreditsBalance: () => ({ data: 50 }),
}));

describe('SellerContactRequests — referred leads', () => {
  it('shows "Referido por" + a neutral no-PII message and hides the unlock for referred leads', () => {
    vi.spyOn(requestQueries, 'useSellerContactRequests').mockReturnValue({
      data: [
        {
          id: 'req-1',
          propertyId: 'prop-1',
          status: 'pending',
          createdAt: new Date().toISOString(),
          name: null,
          phone: null,
          referringAgentId: 'agent-1',
          referringAgent: { name: 'Capturing Agent' },
          property: { id: 'prop-1', title: 'Casa Roma' },
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<SellerContactRequests />);

    expect(screen.getByText(/Referido por Capturing Agent/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Un agente hará una oferta por tu propiedad/i),
    ).toBeInTheDocument();
    // No buyer contact, no unlock CTA.
    expect(screen.queryByText(/Ver datos/i)).toBeNull();
  });

  it('still shows the unlock CTA for a locked direct lead', () => {
    vi.spyOn(requestQueries, 'useSellerContactRequests').mockReturnValue({
      data: [
        {
          id: 'req-2',
          propertyId: 'prop-2',
          status: 'pending',
          createdAt: new Date().toISOString(),
          name: 'Direct Buyer',
          phone: '5511112222',
          referringAgentId: null,
          referringAgent: null,
          property: { id: 'prop-2', title: 'Casa Directa' },
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<SellerContactRequests />);
    expect(screen.getByText(/Ver datos/i)).toBeInTheDocument();
  });
});
