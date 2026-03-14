import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestInfoForm from '../../components/RequestInfoForm.jsx';
import * as requestsApi from '../../lib/api/requests';

describe('RequestInfoForm', () => {
  it('validates inputs and calls addRequest', async () => {
    const spy = vi.spyOn(requestsApi, 'addRequest').mockResolvedValue({ id: 'req-1' });
    const onSuccess = vi.fn();

    render(<RequestInfoForm propertyId="prop-1" onSuccess={onSuccess} />);

    // Submit empty form -> validation errors
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));
    await waitFor(() => expect(screen.getByText(/El nombre/)).toBeInTheDocument());

    // Fill fields
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '5512345678' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
  });
});
