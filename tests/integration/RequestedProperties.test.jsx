import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestedPropertiesList from '../../components/RequestedPropertiesList.jsx';
import * as queries from '../../lib/queries/requests';

describe('Requested properties integration', () => {
  it('fetches and displays requested properties for buyer', async () => {
    const mockData = [
      { id: 'req-1', propertyId: 'prop-1', name: 'Maria', phone: '5599887766', buyerId: 'buyer-demo', property: { id: 'prop-1', title: 'Depto Polanco' } },
      { id: 'req-2', propertyId: 'prop-2', name: 'Carlos', phone: '5577665544', buyerId: 'buyer-demo', property: { id: 'prop-2', title: 'Casa Condesa' } }
    ];

    vi.spyOn(queries, 'useRequestedProperties').mockReturnValue({ data: mockData, isLoading: false });

    render(<RequestedPropertiesList />);

    expect(screen.getByText(/Total: 2 solicitudes/)).toBeInTheDocument();
    expect(screen.getByText('Depto Polanco')).toBeInTheDocument();
    expect(screen.getByText('Casa Condesa')).toBeInTheDocument();
  });
});
