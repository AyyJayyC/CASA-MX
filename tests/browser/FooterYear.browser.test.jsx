import React from 'react';
import { render } from 'vitest-browser-react';

import FooterYear from '@/components/FooterYear.jsx';

describe('FooterYear (Browser)', () => {
  it('renders current year', async () => {
    const screen = render(React.createElement(FooterYear));
    const currentYear = String(new Date().getFullYear());
    await expect.element(screen.getByText(currentYear)).toBeVisible();
  });
});
