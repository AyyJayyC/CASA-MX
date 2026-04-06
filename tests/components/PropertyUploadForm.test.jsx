import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyUploadForm from '../../components/PropertyUploadForm.jsx';
import * as propertiesApi from '../../lib/api/properties';

vi.mock('../../lib/queries/properties', () => ({
  useInvalidateProperties: () => vi.fn(),
}));

describe('PropertyUploadForm', () => {
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
    fireEvent.change(screen.getByLabelText(/Tipo/), { target: { value: 'Casa' } });
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '120' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(screen.getByText(/Propiedad publicada exitosamente/i)).toBeInTheDocument();
    });
  });
});
