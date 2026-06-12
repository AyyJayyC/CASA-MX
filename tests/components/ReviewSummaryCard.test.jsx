import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewSummaryCard from '@/components/ReviewSummaryCard.jsx';

vi.mock('@/components/RatingStars.jsx', () => ({
  default: ({ value }) => React.createElement('span', { 'data-testid': 'stars' }, `Stars: ${value}`),
}));

describe('ReviewSummaryCard', () => {
  it('shows loading state', () => {
    render(React.createElement(ReviewSummaryCard, { loading: true }));
    expect(screen.getByText('Cargando reputación...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(React.createElement(ReviewSummaryCard, { error: 'Failed to load' }));
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows empty state when no reviews', () => {
    render(React.createElement(ReviewSummaryCard, { summary: { totalReviews: 0 } }));
    expect(screen.getByText('Aún no hay reseñas verificadas para este perfil.')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(React.createElement(ReviewSummaryCard, { summary: { totalReviews: 0 }, emptyMessage: 'No reviews' }));
    expect(screen.getByText('No reviews')).toBeInTheDocument();
  });

  it('shows average rating and count', () => {
    render(React.createElement(ReviewSummaryCard, { summary: { averageRating: 4.5, totalReviews: 10 }, role: 'seller' }));
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('10 reseñas')).toBeInTheDocument();
  });

  it('shows singular for one review', () => {
    render(React.createElement(ReviewSummaryCard, { summary: { averageRating: 5, totalReviews: 1 }, role: 'buyer' }));
    expect(screen.getByText('1 reseña')).toBeInTheDocument();
  });

  it('shows default title from role', () => {
    render(React.createElement(ReviewSummaryCard, { summary: { totalReviews: 0 }, role: 'tenant' }));
    expect(screen.getByText('Reputación como Inquilino')).toBeInTheDocument();
  });

  it('shows custom title', () => {
    render(React.createElement(ReviewSummaryCard, { title: 'My Reputation', summary: { totalReviews: 0 } }));
    expect(screen.getByText('My Reputation')).toBeInTheDocument();
  });
});
