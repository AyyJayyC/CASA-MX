import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactRequestsList from '../../components/ContactRequestsList.jsx';
import * as queries from '../../lib/queries/requests';

describe('Contact requests integration', () => {
  it('fetches and displays contact requests for buyer', async () => {
    const mockData = [
      { id: 'req-1', propertyId: 'prop-1', status: 'pending', name: 'Maria', phone: '5599887766', createdAt: new Date().toISOString(), property: { id: 'prop-1', title: 'Depto Polanco' } },
      { id: 'req-2', propertyId: 'prop-2', status: 'contacted', name: 'Carlos', phone: '5577665544', createdAt: new Date().toISOString(), property: { id: 'prop-2', title: 'Casa Condesa', address: 'Calle 123, Col. Centro' } }
    ];

    vi.spyOn(queries, 'useMyContactRequests').mockReturnValue({ data: mockData, isLoading: false });

    render(<ContactRequestsList />);

    expect(screen.getByText(/Total: 2 solicitudes/)).toBeInTheDocument();
    expect(screen.getByText('Depto Polanco')).toBeInTheDocument();
    expect(screen.getByText('Casa Condesa')).toBeInTheDocument();
    expect(screen.getByText('Dirección recibida')).toBeInTheDocument();
    expect(screen.getByText(/Calle 123/)).toBeInTheDocument();
  });
});
