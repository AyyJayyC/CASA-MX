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
          colonia: 'Int Colonia',
          codigoPostal: '02000',
        })
      }
    >
      Validar dirección
    </button>
  ),
}));

describe('Upload integration', () => {
  it('submits a full property through API adapter', async () => {
    const spy = vi.spyOn(propertiesApi, 'addProperty').mockResolvedValue({ id: 'prop-new', title: 'Integration Prop' });

    render(<PropertyUploadForm />);

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Integration Prop' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Integración descripción...' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '2000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección/), { target: { value: 'Calle Int 2' } });
    fireEvent.change(screen.getByLabelText(/Tipo/), { target: { value: 'Departamento' } });
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '80' } });

    fireEvent.click(screen.getByRole('button', { name: /Validar dirección/i }));
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
