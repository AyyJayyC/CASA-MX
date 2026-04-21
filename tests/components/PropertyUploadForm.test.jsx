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

  it('supports keyboard navigation for address suggestions', async () => {
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

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          predictions: [
            {
              place_id: 'mx-1',
              description: 'Begonia 10, Centro, Hermosillo, Sonora, Mexico',
              structured_formatting: {
                main_text: 'Begonia 10',
                secondary_text: 'Centro, Hermosillo, Sonora, Mexico',
              },
            },
            {
              place_id: 'mx-2',
              description: 'Rosales 22, Centro, Hermosillo, Sonora, Mexico',
              structured_formatting: {
                main_text: 'Rosales 22',
                secondary_text: 'Centro, Hermosillo, Sonora, Mexico',
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            formatted_address: 'Rosales 22, Centro, Hermosillo, Sonora, Mexico',
            geometry: {
              location: { lat: 29.0729, lng: -110.9559 },
            },
            address_components: [
              { long_name: '22', short_name: '22', types: ['street_number'] },
              { long_name: 'Rosales', short_name: 'Rosales', types: ['route'] },
              { long_name: 'Centro', short_name: 'Centro', types: ['neighborhood', 'sublocality'] },
              { long_name: 'Hermosillo', short_name: 'Hermosillo', types: ['locality'] },
              { long_name: 'Sonora', short_name: 'Son.', types: ['administrative_area_level_1'] },
              { long_name: '83000', short_name: '83000', types: ['postal_code'] },
              { long_name: 'Mexico', short_name: 'MX', types: ['country'] },
            ],
          },
        }),
      });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByRole('option', { name: 'Sonora' });

    const searchInput = screen.getByPlaceholderText(/San Miguel de Horcasitas/i);
    fireEvent.change(searchInput, { target: { value: 'Begonia 10' } });

    await waitFor(() => {
      expect(screen.getByText(/Begonia 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Rosales 22/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Dirección/i)).toHaveValue('Rosales 22, Centro, Hermosillo, Sonora, C.P. 83000');
      expect(screen.getByLabelText(/^Estado$/i)).toHaveValue('Sonora');
      expect(screen.getByLabelText(/Código Postal/i)).toHaveValue('83000');
    });
  });

  it('shows a clear empty state when no Mexico suggestions are available', async () => {
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
      ok: true,
      json: async () => ({ predictions: [] }),
    });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByRole('option', { name: 'Sonora' });

    fireEvent.change(screen.getByPlaceholderText(/San Miguel de Horcasitas/i), {
      target: { value: '3542 Winesap Road' },
    });

    await waitFor(() => {
      expect(screen.getByText(/No encontramos sugerencias claras en Mexico/i)).toBeInTheDocument();
      expect(screen.getByText(/Agrega ciudad o estado para mejorar el resultado/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
