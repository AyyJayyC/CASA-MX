import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactRequestModal from '../../components/ContactRequestModal.jsx';

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

describe('Contact request flow integration', () => {
  it('opens modal and renders the contact request form', async () => {
    render(<ContactRequestModal propertyId="prop-1" />);

    // Click the outer trigger button
    const buttons = screen.getAllByRole('button', { name: /Solicitar dirección/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Solicitar dirección/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    });
  });
});
