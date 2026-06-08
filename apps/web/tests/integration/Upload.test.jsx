import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyUploadForm from '../../components/PropertyUploadForm.jsx';
import * as propertiesApi from '../../lib/api/properties';

vi.mock('../../lib/queries/properties', () => ({
  useInvalidateProperties: () => vi.fn(),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({
    session: { token: 'test-token' },
  }),
}));

vi.mock('../../lib/api/locations.js', () => ({
  getUnifiedCatalog: async () => ({
    estados: [
      { nombre: 'Ciudad de México', ciudades: [{ nombre: 'Ciudad de México', colonias: ['Demo Colonia', 'Int Colonia'] }] },
    ],
    postalCodeRanges: { CDMX: { min: '01000', max: '16550' } },
  }),
  getStaticCatalog: () => ({}),
  getFilterOptions: async () => ({}),
}));

describe('Upload integration', () => {
  it('submits a full property through API adapter', async () => {
    vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-new', title: 'Integration Prop' });

    render(<PropertyUploadForm />);

    await screen.findByLabelText(/Título/);

    fireEvent.click(screen.getByLabelText(/Certifico que soy el propietario/i));

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Integration Prop' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Integración descripción...' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '2000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección completa/i), { target: { value: 'Calle Int 2' } });
    fireEvent.change(screen.getByLabelText(/^Estado$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Ciudad$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Colonia$/i), { target: { value: 'Int Colonia' } });
    fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { value: '02000' } });
    fireEvent.click(screen.getByLabelText('Departamento'));
    fireEvent.change(screen.getByLabelText(/Recámaras/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Baños/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Metros de construcci/i), { target: { value: '80' } });

    const latInput = document.querySelector('input[name="latitude"]');
    const lngInput = document.querySelector('input[name="longitude"]');
    fireEvent.change(latInput, { target: { value: '19.4326' } });
    fireEvent.change(lngInput, { target: { value: '-99.1332' } });

    const submitButton = screen.getByRole('button', { name: /Publicar propiedad/i });
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/la dirección es requerida/i)).not.toBeInTheDocument();
    });
  });
});
