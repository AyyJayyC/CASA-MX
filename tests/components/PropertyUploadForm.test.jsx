import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyUploadForm from '../../components/PropertyUploadForm.jsx';
import * as propertiesApi from '../../lib/api/properties';

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ session: null }),
}));

vi.mock('../../lib/queries/properties', () => ({
  useInvalidateProperties: () => vi.fn(),
}));

describe('PropertyUploadForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('validates required fields and submits successfully', async () => {
    const spy = vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-x', title: 'Test' });
    vi.spyOn(propertiesApi, 'getLocationsCatalog').mockResolvedValue({
      estados: [
        {
          nombre: 'Ciudad de México',
          ciudades: [
            {
              nombre: 'Ciudad de México',
              colonias: ['Demo Colonia', 'Int Colonia'],
            },
          ],
        },
      ],
    });

    render(<PropertyUploadForm />);

    await screen.findByRole('option', { name: 'Ciudad de México' });

    // Try submitting empty form — should show validation errors
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => {
      expect(screen.getByText(/El título/)).toBeInTheDocument();
    });

    // Fill minimal required fields
    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Mi casa demo' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Descripción larga demo' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección/), { target: { value: 'Calle Demo 1' } });
    fireEvent.change(screen.getByLabelText(/^Estado$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Ciudad$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Colonia$/i), { target: { value: 'Demo Colonia' } });
    fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { value: '01000' } });
    fireEvent.click(screen.getByLabelText('Casa'));
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '120' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(screen.getByText(/Propiedad publicada exitosamente/i)).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyType: 'Casa',
      })
    );
  });

  it('shows a maps configuration error when autocomplete fails upstream', async () => {
    vi.spyOn(propertiesApi, 'getLocationsCatalog').mockResolvedValue({
      estados: [
        {
          nombre: 'Sonora',
          ciudades: [
            {
              nombre: 'Hermosillo',
              colonias: ['Centro'],
            },
          ],
        },
      ],
    });

    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Google Maps is not configured. Set MAPS_API_KEY and ENABLE_BILLABLE_MAPS=true.',
      }),
    });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByRole('option', { name: 'Sonora' });

    fireEvent.change(screen.getByPlaceholderText(/San Miguel de Horcasitas/i), {
      target: { value: 'Begonia 10' },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/maps/autocomplete?input=Begonia%2010')
      );
      expect(screen.getByText(/Google Maps is not configured/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
