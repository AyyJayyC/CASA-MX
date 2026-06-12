import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as reviews from '@/lib/api/reviews';

describe('reviews API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createReview calls POST and returns data', async () => {
    client.apiPost.mockResolvedValue({ data: { id: 'r1', rating: 5 } });
    const result = await reviews.createReview({ userId: 'u1', rating: 5, comment: 'Great' });
    expect(client.apiPost).toHaveBeenCalledWith('/reviews', { userId: 'u1', rating: 5, comment: 'Great' });
    expect(result.id).toBe('r1');
  });

  it('getUserReviews calls GET with role query', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'r1' }] });
    const result = await reviews.getUserReviews('u1', 'seller');
    expect(client.apiGet).toHaveBeenCalledWith('/reviews/user/u1?role=seller');
    expect(result).toHaveLength(1);
  });

  it('getUserReviews omits empty role', async () => {
    client.apiGet.mockResolvedValue({ data: [] });
    await reviews.getUserReviews('u1', '');
    expect(client.apiGet).toHaveBeenCalledWith('/reviews/user/u1');
  });

  it('getReviewSummary calls GET with role', async () => {
    client.apiGet.mockResolvedValue({ data: { average: 4.5, count: 10 } });
    const result = await reviews.getReviewSummary('u1', 'seller');
    expect(client.apiGet).toHaveBeenCalledWith('/reviews/summary/u1?role=seller');
  });

  it('getMyAuthoredReviews calls GET with role', async () => {
    client.apiGet.mockResolvedValue({ data: [{ id: 'r1' }] });
    const result = await reviews.getMyAuthoredReviews('buyer');
    expect(client.apiGet).toHaveBeenCalledWith('/reviews/mine?role=buyer');
  });
});
