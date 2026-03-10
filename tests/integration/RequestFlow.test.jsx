import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestInfoModal from '../../components/RequestInfoModal.jsx';
import * as mockRequests from '../../lib/mock/requests';

describe('Request flow integration', () => {
  it('opens modal and submits request', async () => {
    const spy = vi.spyOn(mockRequests, 'addRequest').mockResolvedValue({ id: 'req-2' });
    render(<RequestInfoModal propertyId="prop-1" />);

    fireEvent.click(screen.getByRole('button', { name: /Solicitar más información/i }));

    // Fill and submit inside modal
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Pedro' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '5522334455' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(screen.getByText(/Solicitud enviada/)).toBeInTheDocument();
  });
});
