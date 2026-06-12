import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }) => React.createElement('a', { 'data-href': href }, children),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

import PropertyList from '@/components/PropertyList.jsx';
import ReviewList from '@/components/ReviewList.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

describe('Component Edge Cases — Production Gate', () => {
  describe('PropertyList', () => {
    it('renders skeleton placeholders when loading', () => {
      const { container } = render(React.createElement(PropertyList, { properties: [], isLoading: true }), { wrapper: Wrapper });
      expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders empty state when not loading and no properties', () => {
      render(React.createElement(PropertyList, { properties: [], isLoading: false }), { wrapper: Wrapper });
      expect(screen.getByText('No hay propiedades disponibles')).toBeInTheDocument();
    });

    it('renders singular count for one property', () => {
      render(React.createElement(PropertyList, { properties: [{ id: '1', title: 'Casa', propertyType: 'Casa', listingType: 'for_sale', price: 100 }], isLoading: false }), { wrapper: Wrapper });
      expect(screen.getByText('1 propiedad encontrada')).toBeInTheDocument();
    });

    it('handles undefined properties array', () => {
      render(React.createElement(PropertyList, { isLoading: false }), { wrapper: Wrapper });
      expect(screen.getByText('No hay propiedades disponibles')).toBeInTheDocument();
    });
  });

  describe('ReviewList', () => {
    it('shows loading state', () => {
      render(React.createElement(ReviewList, { loading: true }));
      expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(React.createElement(ReviewList, { error: 'Error de conexión.' }));
      expect(screen.getByText('Error de conexión.')).toBeInTheDocument();
    });

    it('shows empty state with default message', () => {
      render(React.createElement(ReviewList, { reviews: [] }));
      expect(screen.getByText('Todavía no hay reseñas para mostrar.')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      render(React.createElement(ReviewList, { reviews: [], emptyMessage: 'Este vendedor aún no tiene reseñas.' }));
      expect(screen.getByText('Este vendedor aún no tiene reseñas.')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('hides message when empty', () => {
      const { container } = render(React.createElement(LoadingSpinner, { message: '' }));
      expect(screen.queryByText('Cargando...')).toBeNull();
    });

    it('renders custom message', () => {
      render(React.createElement(LoadingSpinner, { message: 'Publicando propiedad...' }));
      expect(screen.getByText('Publicando propiedad...')).toBeInTheDocument();
    });

    it('renders SVG element', () => {
      const { container } = render(React.createElement(LoadingSpinner));
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders with default md size', () => {
      const { container } = render(React.createElement(LoadingSpinner));
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
