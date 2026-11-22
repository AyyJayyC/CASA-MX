import React from 'react';
import { render } from 'vitest-browser-react';
import { userEvent } from '@vitest/browser/context';

import PropertyImageGallery from '@/components/PropertyImageGallery.jsx';

const images = ['https://example.com/one.jpg', 'https://example.com/two.jpg'];

describe('PropertyImageGallery (Browser)', () => {
  it('opens the lightbox, navigates and closes with Escape', async () => {
    const screen = render(
      React.createElement(PropertyImageGallery, { images, title: 'Demo' }),
    );

    await screen.getByRole('button', { name: /tamaño completo/i }).click();

    const dialog = screen.getByRole('dialog');
    await expect.element(dialog).toBeVisible();
    expect(screen.container.querySelector('dialog img').className).toContain('object-contain');

    await screen.getByRole('button', { name: 'Imagen siguiente' }).click();
    await expect.element(screen.getByText('2 / 2')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect.element(dialog).not.toBeVisible();
  });
});
