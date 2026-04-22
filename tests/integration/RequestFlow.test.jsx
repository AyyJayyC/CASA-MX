import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestInfoModal from '../../components/RequestInfoModal.jsx';

describe('Request flow integration', () => {
  it('opens modal and renders the request form', async () => {
    render(<RequestInfoModal propertyId="prop-1" />);

    fireEvent.click(screen.getByRole('button', { name: /Solicitar más información/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Solicitar más información/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enviar solicitud de información/i })).toBeInTheDocument();
    });
  });
});
