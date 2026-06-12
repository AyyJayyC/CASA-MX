import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/requests', () => ({
  getMyRequests: vi.fn(),
  addRequest: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  default: { trackEvent: vi.fn() },
}));

vi.mock('@/lib/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: vi.fn() }),
}));

import * as requestsApi from '@/lib/api/requests';
import ContactRequestForm from '@/components/ContactRequestForm.jsx';
import ContactRequestModal from '@/components/ContactRequestModal.jsx';

describe('Contact Request Flow — Production Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modal opens when triggered', () => {
    requestsApi.getMyRequests.mockResolvedValue([]);
    render(React.createElement(ContactRequestModal, { propertyId: 'p1' }));

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    fireEvent.click(buttons[0]);

    const nameInput = document.querySelector('#req_name');
    expect(nameInput).toBeTruthy();
  });

  it('form prevents empty submission', async () => {
    render(React.createElement(ContactRequestForm, { propertyId: 'p1' }));

    const submitButton = screen.getByText('Solicitar dirección');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(requestsApi.addRequest).not.toHaveBeenCalled();
    });
  });
});
