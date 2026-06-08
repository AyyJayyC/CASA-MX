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

vi.mock('../../lib/api/locations.js', () => ({
  getUnifiedCatalog: async () => ({
    estados: [
      { nombre: 'Ciudad de México', ciudades: [{ nombre: 'Ciudad de México', colonias: ['Demo Colonia', 'Int Colonia'] }] },
      { nombre: 'Sonora', ciudades: [{ nombre: 'Hermosillo', colonias: ['Centro', 'Pitic'] }] },
      { nombre: 'Quintana Roo', ciudades: [{ nombre: 'Cancún', colonias: ['Zona Hotelera'] }] },
    ],
    postalCodeRanges: { CDMX: { min: '01000', max: '16550' } },
  }),
  getStaticCatalog: () => ({}),
  getFilterOptions: async () => ({}),
}));

describe('PropertyUploadForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('validates required fields before submit', async () => {
    vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-x', title: 'Test' });

    render(<PropertyUploadForm />);

    await screen.findByLabelText(/Título/);

    const ownershipCheckbox = screen.getByLabelText(/Certifico que soy el propietario/i);
    fireEvent.click(ownershipCheckbox);
    expect(ownershipCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => {
      expect(screen.getByText(/título debe tener al menos 5 caracteres/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Mi casa demo' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Descripción larga demo' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección completa/i), { target: { value: 'Calle Demo 1' } });
    fireEvent.change(screen.getByLabelText(/^Estado$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Ciudad$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Colonia$/i), { target: { value: 'Demo Colonia' } });
    fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { value: '01000' } });
    fireEvent.click(screen.getByLabelText('Casa'));
    fireEvent.change(screen.getByLabelText(/Recámaras/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Baños/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Metros de construcci/i), { target: { value: '120' } });

    const latInput = document.querySelector('input[name="latitude"]');
    const lngInput = document.querySelector('input[name="longitude"]');
    fireEvent.change(latInput, { target: { value: '19.4326' } });
    fireEvent.change(lngInput, { target: { value: '-99.1332' } });

    const submitButton = screen.getByRole('button', { name: /Publicar propiedad/i });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/título debe tener al menos 5 caracteres/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/la dirección es requerida/i)).not.toBeInTheDocument();
    });
  });

  it('shows a maps configuration error when autocomplete fails upstream', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Google Maps is not configured. Set MAPS_API_KEY and ENABLE_BILLABLE_MAPS=true.',
      }),
    });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByLabelText(/Título/);

    fireEvent.change(screen.getByPlaceholderText(/San Miguel de Horcasitas/i), {
      target: { value: 'Begonia 10' },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/maps/autocomplete'),
        expect.objectContaining({ credentials: 'include' })
      );
      expect(screen.getByText(/Google Maps is not configured/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('supports keyboard navigation for address suggestions', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        predictions: [
          { description: 'Rosales 22, Centro, Hermosillo, Sonora, C.P. 83000' },
        ],
      }),
    });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByLabelText(/Título/);

    const searchInput = screen.getByPlaceholderText(/San Miguel de Horcasitas/i);
    fireEvent.change(searchInput, { target: { value: 'Begonia 10' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('Begonia 10');
    }, { timeout: 3000 });

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
  });

  it('shows a clear empty state when no Mexico suggestions are available', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ predictions: [] }),
    });

    render(<PropertyUploadForm listingType="for_rent" />);

    await screen.findByLabelText(/Título/);

    fireEvent.change(screen.getByPlaceholderText(/San Miguel de Horcasitas/i), {
      target: { value: '3542 Winesap Road' },
    });

    await waitFor(() => {
      expect(screen.getByText(/No encontramos sugerencias claras en Mexico/i)).toBeInTheDocument();
      expect(screen.getByText(/Agrega ciudad o estado para mejorar el resultado/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
