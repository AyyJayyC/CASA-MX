import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewList from '@/components/ReviewList.jsx';

vi.mock('@/components/RatingStars.jsx', () => ({
  default: ({ value }) => React.createElement('span', { 'data-testid': 'stars' }, `Stars: ${value}`),
}));

vi.mock('@/components/VerificationBadges', () => ({
  default: () => null,
}));

describe('ReviewList', () => {
  it('shows loading state', () => {
    render(React.createElement(ReviewList, { loading: true }));
    expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(React.createElement(ReviewList, { error: 'Failed to load reviews' }));
    expect(screen.getByText('Failed to load reviews')).toBeInTheDocument();
  });

  it('shows empty state with default message', () => {
    render(React.createElement(ReviewList, { reviews: [] }));
    expect(screen.getByText('Todavía no hay reseñas para mostrar.')).toBeInTheDocument();
  });

  it('shows empty state with custom message', () => {
    render(React.createElement(ReviewList, { reviews: [], emptyMessage: 'No reviews yet.' }));
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
  });

  it('renders review items', () => {
    const reviews = [
      { id: 'r1', rating: 5, comment: 'Great place!', reviewer: { name: 'John', activeRole: 'buyer' }, createdAt: '2024-01-01' },
      { id: 'r2', rating: 4, comment: 'Nice', reviewer: { name: 'Jane', activeRole: 'tenant' }, createdAt: '2024-01-02' },
    ];
    render(React.createElement(ReviewList, { reviews }));
    expect(screen.getByText('Great place!')).toBeInTheDocument();
    expect(screen.getByText('Nice')).toBeInTheDocument();
  });
});
