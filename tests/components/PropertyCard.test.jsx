import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/properties',
  useSearchParams: () => new URLSearchParams('type=for_sale'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) =>
    React.createElement('a', { ...props, 'data-href': href }, children),
}));

import PropertyCard from '@/components/PropertyCard.jsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Wrapper({ children }) {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
}

const baseProperty = {
  id: 'prop-1',
  title: 'Casa en Hermosillo',
  colonia: 'Centenario',
  ciudad: 'Hermosillo',
  estado: 'Sonora',
  propertyType: 'Casa',
  listingType: 'for_sale',
  price: 2500000,
  currency: 'MXN',
  bedrooms: 3,
  bathrooms: 2,
  parkingSpaces: 1,
  superficieConstruccion: 150,
  superficieTerreno: 200,
  primaryImage: { url: '/test.jpg' },
  images: [{ url: '/test.jpg' }],
};

describe('PropertyCard', () => {
  it('renders property title', () => {
    render(
      React.createElement(PropertyCard, { property: baseProperty }),
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Casa en Hermosillo')).toBeInTheDocument();
  });

  it('renders', () => {
    const { container } = render(
      React.createElement(PropertyCard, { property: baseProperty }),
      { wrapper: Wrapper },
    );
    expect(container.textContent).toContain('Casa en Hermosillo');
  });

  it('links to property detail page', () => {
    const { container } = render(
      React.createElement(PropertyCard, { property: baseProperty }),
      { wrapper: Wrapper },
    );
    const link = container.querySelector('a[data-href*="prop-1"]');
    expect(link).toBeTruthy();
  });
});
