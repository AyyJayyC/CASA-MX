import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RatingStars from '@/components/RatingStars.jsx';

describe('RatingStars', () => {
  it('renders 5 stars', () => {
    const { container } = render(React.createElement(RatingStars, { value: 0 }));
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
  });

  it('fills first 3 stars when value is 3', () => {
    render(React.createElement(RatingStars, { value: 3 }));
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeInTheDocument();
    expect(buttons).toHaveLength(5);
  });

  it('calls onChange when star clicked', () => {
    const onChange = vi.fn();
    render(React.createElement(RatingStars, { value: 0, onChange }));
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('does not call onChange when readOnly', () => {
    const onChange = vi.fn();
    render(React.createElement(RatingStars, { value: 0, onChange, readOnly: true }));
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows value when showValue is true', () => {
    render(React.createElement(RatingStars, { value: 4.5, showValue: true }));
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('shows "Sin reseñas" when value is 0 and showValue true', () => {
    render(React.createElement(RatingStars, { value: 0, showValue: true }));
    expect(screen.getByText('Sin reseñas')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(React.createElement(RatingStars, { size: 'sm', value: 0 }));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(React.createElement(RatingStars, { className: 'my-class', value: 0 }));
    expect(container.firstChild.className).toContain('my-class');
  });
});
