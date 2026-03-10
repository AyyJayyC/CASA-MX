import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyUploadForm from '../../components/PropertyUploadForm.jsx';
import * as mockStore from '../../lib/mock/properties';

describe('Upload integration', () => {
  it('submits a full property and stores it in mock store', async () => {
    const spy = vi.spyOn(mockStore, 'addProperty').mockResolvedValue({ id: 'prop-new', title: 'Integration Prop' });

    render(<PropertyUploadForm />);

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Integration Prop' } });
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: 'Integración descripción...' } });
    fireEvent.change(screen.getByLabelText(/Precio/), { target: { value: '2000000' } });
    fireEvent.change(screen.getByLabelText(/Dirección/), { target: { value: 'Calle Int 2' } });
    fireEvent.change(screen.getByLabelText(/Colonia/), { target: { value: 'Int Colonia' } });
    fireEvent.change(screen.getByLabelText(/Tipo/), { target: { value: 'Departamento' } });
    fireEvent.change(screen.getByLabelText(/Metros cuadrados/), { target: { value: '80' } });

    fireEvent.click(screen.getByRole('button', { name: /Validar dirección/i }));
    fireEvent.click(screen.getByRole('button', { name: /Publicar propiedad/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
