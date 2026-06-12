import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/properties',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) =>
    React.createElement('a', { ...props, 'data-href': href }, children),
}));

import PropertyList from '@/components/PropertyList.jsx';

const properties = [
  { id: '1', title: 'Casa A', colonia: 'Centro', propertyType: 'Casa', listingType: 'for_sale', price: 1000000 },
  { id: '2', title: 'Depto B', colonia: 'Norte', propertyType: 'Departamento', listingType: 'for_sale', price: 2000000 },
];

describe('PropertyList', () => {
  it('renders property count', () => {
    render(React.createElement(PropertyList, { properties, isLoading: false }));
    expect(screen.getByText('2 propiedades encontradas')).toBeInTheDocument();
  });

  it('renders singular count for one property', () => {
    render(React.createElement(PropertyList, { properties: [properties[0]], isLoading: false }));
    expect(screen.getByText('1 propiedad encontrada')).toBeInTheDocument();
  });

  it('shows empty state when no properties', () => {
    render(React.createElement(PropertyList, { properties: [], isLoading: false }));
    expect(screen.getByText('No hay propiedades disponibles')).toBeInTheDocument();
  });
});
