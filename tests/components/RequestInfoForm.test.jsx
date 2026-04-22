import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestInfoForm from '../../components/RequestInfoForm.jsx';
import * as requestsApi from '../../lib/api/requests';

vi.mock('../../lib/api/requests', () => ({
  addRequest: vi.fn(),
}));

describe('RequestInfoForm', () => {
  it('validates inputs before submit', async () => {
    requestsApi.addRequest.mockResolvedValue({ id: 'req-1' });
    const onSuccess = vi.fn();

    render(<RequestInfoForm propertyId="prop-1" onSuccess={onSuccess} />);

    // Submit empty form -> validation errors
    fireEvent.click(screen.getByRole('button', { name: /Enviar solicitud de información/i }));
    await waitFor(() => expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument());

    // Fill fields
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan Perez' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '5512345678' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar solicitud de información/i }));

    await waitFor(() => {
      expect(screen.queryByText(/El nombre es requerido/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Email inválido/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/El teléfono es requerido/i)).not.toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
