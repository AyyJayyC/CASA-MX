import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const pushSpy = vi.fn();
// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushSpy }),
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthContext } from '../../lib/auth/AuthContext.jsx';
import RegisterPage from '../../app/register/page.jsx';

describe('RegisterPage', () => {
  it('disables submit until a role is selected and submits successfully', async () => {
    const mockRegister = vi.fn(async () => ({ user: { id: 'u1' } }));
    const mockAuthValue = {
      isAuthenticated: false,
      register: mockRegister
    };



    const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <RegisterPage />
      </AuthContext.Provider>
    );

    const submit = screen.getByRole('button', { name: /Crear Cuenta/i });
    expect(submit).toBeDisabled();

    // select role
    const buyerButton = screen.getByRole('button', { name: /Comprar propiedad/i });
    fireEvent.click(buyerButton);

    expect(submit).toBeEnabled();

    // fill form
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'TestPassword123' } });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(submit);

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    expect(pushSpy).toHaveBeenCalled();
    expect(pushSpy.mock.calls[0][0]).toMatch(/^\/login\?registered=true/);
  });
});
