import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';

function BuggyComponent({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test error');
  return React.createElement('div', null, 'All good');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      React.createElement(ErrorBoundary, null,
        React.createElement('div', { 'data-testid': 'child' }, 'Content')
      )
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      React.createElement(ErrorBoundary, null,
        React.createElement(BuggyComponent, { shouldThrow: true })
      )
    );
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('shows error ID', () => {
    render(
      React.createElement(ErrorBoundary, null,
        React.createElement(BuggyComponent, { shouldThrow: true })
      )
    );
    expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
  });
});
