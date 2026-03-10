/**
 * Integration test for property search/filter
 * Purpose: Ensure the search input filters results as expected.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyList from '../../components/PropertyList.jsx';
import * as queries from '../../lib/queries/properties';
import { properties as mockProperties } from '../../lib/mock/properties';

describe('PropertyList integration', () => {
  it('filters properties by query', async () => {
    // Mock the hook to avoid needing a QueryClientProvider in this integration test
    vi.spyOn(queries, 'useProperties').mockReturnValue({ data: mockProperties, isLoading: false });

    // Render component
    render(<PropertyList />);

    const input = screen.getByLabelText('Buscar propiedades');
    expect(input).toBeInTheDocument();

    // Type a query that matches 'Polanco'
    fireEvent.change(input, { target: { value: 'Polanco' } });

    await waitFor(() => {
      expect(screen.getByText(/Departamento en Polanco/)).toBeInTheDocument();
    });
  });
});
