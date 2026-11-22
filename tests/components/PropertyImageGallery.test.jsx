import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import PropertyImageGallery from '../../components/PropertyImageGallery.jsx';

describe('PropertyImageGallery', () => {
  const images = ['https://example.com/one.jpg', 'https://example.com/two.jpg', 'https://example.com/three.jpg'];

  it('shows an empty state when there are no images', () => {
    render(<PropertyImageGallery images={[]} title="Demo" />);

    expect(screen.getByText(/Aún no hay imágenes/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Imagen siguiente/i })).not.toBeInTheDocument();
  });

  it('hides navigation buttons when there is only one image', () => {
    render(<PropertyImageGallery images={[images[0]]} title="Demo" />);

    expect(screen.getByText('1 de 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Imagen anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Imagen siguiente/i })).not.toBeInTheDocument();
  });

  it('navigates with buttons while respecting boundaries', () => {
    render(<PropertyImageGallery images={images} title="Demo" />);

    const trigger = screen.getByRole('button', { name: /tamaño completo/i });
    const hero = within(trigger.parentElement);
    const previousButton = hero.getByRole('button', { name: /Imagen anterior/i });
    const nextButton = hero.getByRole('button', { name: /Imagen siguiente/i });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    expect(previousButton).toBeEnabled();

    fireEvent.click(previousButton);
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(previousButton).toBeDisabled();
  });

  it('opens a native dialog lightbox and navigates with arrow keys', () => {
    const { container } = render(<PropertyImageGallery images={images} title="Demo" />);

    const trigger = screen.getByRole('button', { name: /tamaño completo/i });
    const dialogEl = container.querySelector('dialog');
    dialogEl.showModal = vi.fn();
    dialogEl.close = vi.fn();

    fireEvent.click(trigger);
    expect(dialogEl.showModal).toHaveBeenCalledTimes(1);

    const labelledBy = dialogEl.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('gallery-lightbox-title');
    const labelEl = document.getElementById(labelledBy);
    expect(labelEl).not.toBeNull();
    expect(container.contains(labelEl)).toBe(true);

    fireEvent.keyDown(dialogEl, { key: 'ArrowRight' });
    fireEvent.keyDown(dialogEl, { key: 'ArrowRight' });
    expect(screen.getByText('3 de 3')).toBeInTheDocument();

    fireEvent.click(within(dialogEl).getByLabelText('Cerrar galería'));
    expect(dialogEl.close).toHaveBeenCalled();
  });
});
