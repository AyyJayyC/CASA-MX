import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactRequestForm from '../../components/ContactRequestForm.jsx';
import * as requestsApi from '../../lib/api/requests';

vi.mock('../../lib/api/requests', () => ({
  addRequest: vi.fn(),
}));

describe('ContactRequestForm', () => {
  it('validates inputs before submit', async () => {
    requestsApi.addRequest.mockResolvedValue({ id: 'req-1' });
    const onSuccess = vi.fn();

    render(<ContactRequestForm propertyId="prop-1" onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /Solicitar dirección/i }));
    await waitFor(() => expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Nombre completo/i), { target: { value: 'Juan Perez' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '5512345678' } });

    fireEvent.click(screen.getByRole('button', { name: /Solicitar dirección/i }));

    await waitFor(() => {
      expect(screen.queryByText(/El nombre es requerido/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/El teléfono es requerido/i)).not.toBeInTheDocument();
    });
  });
});
