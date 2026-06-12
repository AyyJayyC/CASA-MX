import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as subscriptions from '@/lib/api/subscriptions';

describe('subscriptions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSubscriptionCheckoutSession calls POST with priceId', async () => {
    client.apiPost.mockResolvedValue({ data: { url: 'http://checkout' } });
    const result = await subscriptions.createSubscriptionCheckoutSession('price_123');
    expect(client.apiPost).toHaveBeenCalledWith('/subscriptions/checkout-session', { priceId: 'price_123' });
    expect(result.url).toBe('http://checkout');
  });

  it('createSubscriptionCheckoutSession calls POST with empty body when no priceId', async () => {
    client.apiPost.mockResolvedValue({ data: { url: 'http://checkout' } });
    await subscriptions.createSubscriptionCheckoutSession(null);
    expect(client.apiPost).toHaveBeenCalledWith('/subscriptions/checkout-session', {});
  });

  it('getSubscriptionStatus returns data', async () => {
    client.apiGet.mockResolvedValue({ data: { status: 'active' } });
    const result = await subscriptions.getSubscriptionStatus();
    expect(result.status).toBe('active');
  });

  it('createBillingPortalSession returns data', async () => {
    client.apiPost.mockResolvedValue({ data: { url: 'http://billing' } });
    const result = await subscriptions.createBillingPortalSession();
    expect(result.url).toBe('http://billing');
  });
});
