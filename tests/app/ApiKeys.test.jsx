import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ApiKeysPage from '../../app/dashboard/integrations/page.jsx';

const listApiKeys = vi.fn();
const createApiKey = vi.fn();
const revokeApiKey = vi.fn();

vi.mock('../../lib/api/apiKeys', () => ({
  listApiKeys: (...args) => listApiKeys(...args),
  createApiKey: (...args) => createApiKey(...args),
  revokeApiKey: (...args) => revokeApiKey(...args),
}));

vi.mock('../../lib/auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Agent One', activeRole: 'agent' },
    isAuthenticated: true,
  }),
  default: () => ({
    user: { id: 'u1', name: 'Agent One', activeRole: 'agent' },
    isAuthenticated: true,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const KEYS = [
  {
    id: 'k1',
    label: 'Pipeline',
    keyPrefix: 'cmx_pub_ab12',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastUsedAt: null,
    revokedAt: null,
  },
];

describe('ApiKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listApiKeys.mockResolvedValue(KEYS);
    createApiKey.mockResolvedValue({
      id: 'k2',
      label: 'Nueva',
      key: 'cmx_pub_secret_raw',
      prefix: 'cmx_pub_secr',
      warning: 'Falta verificar INE',
    });
    revokeApiKey.mockResolvedValue({});
  });

  it('renders the title and existing keys', async () => {
    render(<ApiKeysPage />);
    await waitFor(() => expect(screen.getByText('API Keys')).toBeInTheDocument());
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText(/cmx_pub_ab12/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no keys', async () => {
    listApiKeys.mockResolvedValue([]);
    render(<ApiKeysPage />);
    await waitFor(() =>
      expect(screen.getByText(/no tienes api keys/i)).toBeInTheDocument(),
    );
  });

  it('creates a key and shows the raw value exactly once', async () => {
    render(<ApiKeysPage />);
    await waitFor(() => screen.getByText('Pipeline'));

    fireEvent.click(screen.getByText('Nueva API key'));
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Mi key' },
    });
    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => expect(createApiKey).toHaveBeenCalledWith('Mi key'));
    await waitFor(() =>
      expect(screen.getByText('cmx_pub_secret_raw')).toBeInTheDocument(),
    );
    expect(screen.getByText(/no se mostrará otra vez/i)).toBeInTheDocument();
  });

  it('copies the raw key to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ApiKeysPage />);
    await waitFor(() => screen.getByText('Pipeline'));

    fireEvent.click(screen.getByText('Nueva API key'));
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Mi key' },
    });
    fireEvent.click(screen.getByText('Crear'));
    await waitFor(() => screen.getByText('cmx_pub_secret_raw'));

    fireEvent.click(screen.getByText('Copiar'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('cmx_pub_secret_raw'));
  });

  it('revokes a key after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ApiKeysPage />);
    await waitFor(() => screen.getByText('Pipeline'));

    fireEvent.click(screen.getByText('Revocar'));
    await waitFor(() => expect(revokeApiKey).toHaveBeenCalledWith('k1'));
  });

  it('does not revoke when the user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ApiKeysPage />);
    await waitFor(() => screen.getByText('Pipeline'));

    fireEvent.click(screen.getByText('Revocar'));
    expect(revokeApiKey).not.toHaveBeenCalled();
  });
});
