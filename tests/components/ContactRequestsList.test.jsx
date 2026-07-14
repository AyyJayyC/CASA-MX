import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactRequestsList from '../../components/ContactRequestsList.jsx';
import * as queries from '../../lib/queries/requests';

describe('ContactRequestsList', () => {
  it('displays contact requests for a client', async () => {
    const mockData = [
      { id: 'req-1', propertyId: 'prop-1', status: 'pending', createdAt: new Date().toISOString(), property: { id: 'prop-1', title: 'Casa Roma' } }
    ];

    vi.spyOn(queries, 'useMyContactRequests').mockReturnValue({ data: mockData, isLoading: false });

    render(<ContactRequestsList />);

    expect(screen.getByText(/Total: 1 solicitud/)).toBeInTheDocument();
    expect(screen.getByText('Casa Roma')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows empty state when no requests', () => {
    vi.spyOn(queries, 'useMyContactRequests').mockReturnValue({ data: [], isLoading: false });

    render(<ContactRequestsList />);

    expect(screen.getByText(/No has solicitado/)).toBeInTheDocument();
  });
});
