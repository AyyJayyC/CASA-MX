import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestedPropertiesList from '../../components/RequestedPropertiesList.jsx';
import * as queries from '../../lib/queries/requests';

describe('RequestedPropertiesList', () => {
  it('displays requested properties for a buyer', async () => {
    const mockData = [
      { id: 'req-1', propertyId: 'prop-1', buyerId: 'buyer-demo', createdAt: new Date().toISOString(), message: 'Nombre: Juan', property: { id: 'prop-1', title: 'Casa Roma' } }
    ];

    vi.spyOn(queries, 'useRequestedProperties').mockReturnValue({ data: mockData, isLoading: false });

    render(<RequestedPropertiesList />);

    expect(screen.getByText(/Total: 1 solicitud/)).toBeInTheDocument();
    expect(screen.getByText('Casa Roma')).toBeInTheDocument();
    expect(screen.getByText(/Solicitud enviada|Información enviada/)).toBeInTheDocument();
  });

  it('shows empty state when no requests', () => {
    vi.spyOn(queries, 'useRequestedProperties').mockReturnValue({ data: [], isLoading: false });

    render(<RequestedPropertiesList />);

    expect(screen.getByText(/No has solicitado/)).toBeInTheDocument();
  });
});
