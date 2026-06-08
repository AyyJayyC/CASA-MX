import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('navigates with buttons and keyboard while respecting boundaries', () => {
    render(<PropertyImageGallery images={images} title="Demo" />);

    const previousButton = screen.getByRole('button', { name: /Imagen anterior/i });
    const nextButton = screen.getByRole('button', { name: /Imagen siguiente/i });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    expect(previousButton).toBeEnabled();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('3 de 3')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
  });
});