import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

describe('LoadingSpinner', () => {
  it('renders default message', () => {
    render(React.createElement(LoadingSpinner));
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(React.createElement(LoadingSpinner, { message: 'Loading data...' }));
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without message when empty string', () => {
    render(React.createElement(LoadingSpinner, { message: '' }));
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
  });

  it('renders SVG spinner', () => {
    const { container } = render(React.createElement(LoadingSpinner));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(React.createElement(LoadingSpinner, { className: 'my-custom' }));
    expect(container.firstChild.className).toContain('my-custom');
  });

  it('renders with an SVG element', () => {
    const { container } = render(React.createElement(LoadingSpinner));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
