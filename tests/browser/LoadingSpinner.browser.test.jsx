import React from 'react';
import { render } from 'vitest-browser-react';
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

import LoadingSpinner from '@/components/LoadingSpinner.jsx';

describe('LoadingSpinner (Browser)', () => {
  it('renders with default message', async () => {
    const screen = render(React.createElement(LoadingSpinner));
    await expect.element(screen.getByText('Cargando...')).toBeVisible();
  });

  it('renders SVG animation', async () => {
    const screen = render(React.createElement(LoadingSpinner));
    const svg = screen.container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders custom message', async () => {
    const screen = render(React.createElement(LoadingSpinner, { message: 'Processing...' }));
    await expect.element(screen.getByText('Processing...')).toBeVisible();
  });

  it('hides message when empty', async () => {
    const screen = render(React.createElement(LoadingSpinner, { message: '' }));
    await expect.element(screen.getByText('Cargando...')).not.toBeInTheDocument();
  });
});
