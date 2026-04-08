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

describe('Upload integration', () => {
  it('submits a full property through API adapter', async () => {
    const spy = vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-new', title: 'Integration Prop' });
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

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Integration Prop' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Integración descripción...' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '2000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección/), { target: { value: 'Calle Int 2' } });
    fireEvent.change(screen.getByLabelText(/^Estado$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Ciudad$/i), { target: { value: 'Ciudad de México' } });
    fireEvent.change(screen.getByLabelText(/^Colonia$/i), { target: { value: 'Int Colonia' } });
    fireEvent.change(screen.getByLabelText(/Código Postal/i), { target: { value: '02000' } });
    fireEvent.click(screen.getByLabelText('Departamento'));
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '80' } });

    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
