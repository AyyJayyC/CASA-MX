import React from 'react';
import { render } from 'vitest-browser-react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/properties',
  useSearchParams: () => new URLSearchParams('type=for_sale'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) =>
    React.createElement('a', { ...props, 'data-href': href }, children),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

import PropertyCard from '@/components/PropertyCard.jsx';

const property = {
  id: 'prop-browser-1',
  title: 'Casa en Hermosillo - Browser Test',
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

function renderWithQuery(ui) {
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.isValidElement(ui) ? ui : React.createElement(ui),
    ),
  );
}

describe('PropertyCard (Browser)', () => {
  it('renders property title', async () => {
    const screen = renderWithQuery(React.createElement(PropertyCard, { property }));
    await expect.element(screen.getByText('Casa en Hermosillo - Browser Test')).toBeVisible();
  });

  it('renders property price', async () => {
    const screen = renderWithQuery(React.createElement(PropertyCard, { property }));
    await expect.element(screen.getByText(/\$2,500,000/)).toBeVisible();
  });

  it('renders as link to detail page', async () => {
    const screen = renderWithQuery(React.createElement(PropertyCard, { property }));
    const link = screen.container.querySelector('a[data-href*="prop-browser-1"]');
    expect(link).toBeTruthy();
  });
});
