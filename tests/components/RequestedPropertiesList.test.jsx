import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestedPropertiesList from '../../components/RequestedPropertiesList.jsx';
import * as mockRequests from '../../lib/mock/requests';
import * as queries from '../../lib/queries/requests';

describe('RequestedPropertiesList', () => {
  it('displays requested properties for a buyer', async () => {
    // Mock some requests
    const mockData = [
      { id: 'req-1', propertyId: 'prop-1', name: 'Juan', phone: '5512345678', buyerId: 'buyer-demo', property: { id: 'prop-1', title: 'Casa Roma' } }
    ];

    vi.spyOn(queries, 'useRequestedProperties').mockReturnValue({ data: mockData, isLoading: false });

    render(<RequestedPropertiesList />);

    expect(screen.getByText(/Total: 1 solicitud/)).toBeInTheDocument();
    expect(screen.getByText('Casa Roma')).toBeInTheDocument();
    expect(screen.getByText(/Juan/)).toBeInTheDocument();
  });

  it('shows empty state when no requests', () => {
    vi.spyOn(queries, 'useRequestedProperties').mockReturnValue({ data: [], isLoading: false });

    render(<RequestedPropertiesList />);

    expect(screen.getByText(/No has solicitado/)).toBeInTheDocument();
  });
});
