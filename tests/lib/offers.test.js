import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
}));

import * as offers from '@/lib/api/offers';

describe('offers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitPropertyOffer calls POST and returns data', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'o1', amount: 500000 } });
    const result = await offers.submitPropertyOffer('prop1', { amount: 500000 });
    expect(client.apiPost).toHaveBeenCalledWith('/properties/prop1/offers', { amount: 500000 });
    expect(result.id).toBe('o1');
  });

  it('getPropertyOffers returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'o1' }] });
    const result = await offers.getPropertyOffers('prop1');
    expect(client.apiGet).toHaveBeenCalledWith('/properties/prop1/offers');
    expect(result).toHaveLength(1);
  });

  it('getMySellerOffers returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'o1' }] });
    const result = await offers.getMySellerOffers();
    expect(client.apiGet).toHaveBeenCalledWith('/offers/seller');
    expect(result).toHaveLength(1);
  });

  it('getMyBuyerOffers returns data', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'o1' }] });
    const result = await offers.getMyBuyerOffers();
    expect(client.apiGet).toHaveBeenCalledWith('/offers/mine');
    expect(result).toHaveLength(1);
  });

  it('respondToOffer calls PATCH and returns data', async () => {
    client.apiPatch.mockResolvedValue({ data: { status: 'accepted' } });
    const result = await offers.respondToOffer('o1', { status: 'accepted' });
    expect(client.apiPatch).toHaveBeenCalledWith('/offers/o1', { status: 'accepted' });
    expect(result.status).toBe('accepted');
  });
});
