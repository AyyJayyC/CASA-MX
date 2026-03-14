import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyUploadForm from '../../components/PropertyUploadForm.jsx';
import * as propertiesApi from '../../lib/api/properties';

vi.mock('../../lib/queries/properties', () => ({
  useInvalidateProperties: () => vi.fn(),
}));

vi.mock('../../components/AddressAutocomplete', () => ({
  default: ({ onChange }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          estado: 'Ciudad de México',
          ciudad: 'Ciudad de México',
          colonia: 'Demo Colonia',
          codigoPostal: '01000',
        })
      }
    >
      Validar dirección
    </button>
  ),
}));

describe('PropertyUploadForm', () => {
  it('validates required fields and submits successfully', async () => {
    const spy = vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-x', title: 'Test' });

    render(<PropertyUploadForm />);

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
    fireEvent.change(screen.getByLabelText(/Tipo/), { target: { value: 'Casa' } });
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '120' } });

    // Validate address placeholder
    fireEvent.click(screen.getByRole('button', { name: /Validar dirección/i }));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
      expect(screen.getByText(/Propiedad publicada exitosamente/i)).toBeInTheDocument();
    });
  });
});
