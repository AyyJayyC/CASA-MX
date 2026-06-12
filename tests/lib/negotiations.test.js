import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as negotiations from '@/lib/api/negotiations';

describe('negotiations API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNegotiationByApplication calls GET', async () => {
    client.apiGet.mockResolvedValue({ id: 'neg1' });
    await negotiations.getNegotiationByApplication('app1');
    expect(client.apiGet).toHaveBeenCalledWith('/negotiations/by-application/app1');
  });

  it('startNegotiation calls POST with payload', async () => {
    client.apiPost.mockResolvedValue({ id: 'neg1' });
    await negotiations.startNegotiation({ rentalApplicationId: 'app1', proposedRent: 15000, message: 'Offer' });
    expect(client.apiPost).toHaveBeenCalledWith('/negotiations', {
      rentalApplicationId: 'app1',
      proposedRent: 15000,
      message: 'Offer',
    });
  });

  it('submitCounterOffer calls POST', async () => {
    client.apiPost.mockResolvedValue({ id: 'neg1' });
    await negotiations.submitCounterOffer('neg1', { proposedRent: 12000, message: 'Counter' });
    expect(client.apiPost).toHaveBeenCalledWith('/negotiations/neg1/counter', {
      proposedRent: 12000,
      message: 'Counter',
    });
  });

  it('respondToOffer calls POST', async () => {
    client.apiPost.mockResolvedValue({ status: 'accepted' });
    await negotiations.respondToOffer('neg1', 'accept');
    expect(client.apiPost).toHaveBeenCalledWith('/negotiations/neg1/respond', { action: 'accept' });
  });
});
