import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PropertyList from '../../components/PropertyList.jsx';
import * as queries from '../../lib/queries/properties';

const propertiesFixture = [
  {
    id: 'prop-1',
    title: 'Departamento en Polanco',
    colonia: 'Polanco',
    propertyType: 'Departamento',
    listingType: 'for_sale',
    price: 3500000,
  },
  {
    id: 'prop-2',
    title: 'Casa en Coyoacán',
    colonia: 'Coyoacán',
    propertyType: 'Casa',
    listingType: 'for_sale',
    price: 4200000,
  },
];

describe('PropertyList integration', () => {
  it('renders property cards from provided data', () => {
    vi.spyOn(queries, 'useProperties').mockReturnValue({
      data: { pages: [propertiesFixture], pageParams: [0] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<PropertyList properties={propertiesFixture} isLoading={false} />);

    expect(screen.getByText('Departamento en Polanco')).toBeInTheDocument();
    expect(screen.getByText('Casa en Coyoacán')).toBeInTheDocument();
    expect(screen.getByText('2 propiedades encontradas')).toBeInTheDocument();
  });

  it('shows empty state when no properties', () => {
    vi.spyOn(queries, 'useProperties').mockReturnValue({
      data: { pages: [[]], pageParams: [0] },
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<PropertyList properties={[]} isLoading={false} />);

    expect(screen.getByText('No hay propiedades disponibles')).toBeInTheDocument();
  });
});
