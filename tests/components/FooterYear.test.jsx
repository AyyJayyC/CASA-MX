import React from 'react';
import { render } from '@testing-library/react';
import FooterYear from '@/components/FooterYear.jsx';

describe('FooterYear', () => {
  it('renders the current year number', () => {
    const { container } = render(React.createElement(FooterYear));
    expect(container.textContent).toBe(String(new Date().getFullYear()));
  });
});
