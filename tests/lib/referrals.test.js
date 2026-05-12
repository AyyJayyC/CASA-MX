import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const BACKEND_URL = 'http://localhost:3001';

describe('Referrals API', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getMyReferralCode returns code on success', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { referralCode: 'ABC123' } }),
    });

    const { getMyReferralCode } = await import('../../lib/api/referrals');
    const code = await getMyReferralCode();
    expect(code).toBe('ABC123');
  });

  it('getMyReferralCode returns null on 401', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 401 });

    const { getMyReferralCode } = await import('../../lib/api/referrals');
    const code = await getMyReferralCode();
    expect(code).toBeNull();
  });

  it('getMyReferralCode returns null on network error', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network fail'));

    const { getMyReferralCode } = await import('../../lib/api/referrals');
    const code = await getMyReferralCode();
    expect(code).toBeNull();
  });

  it('trackReferralClick sends POST with correct body', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true });

    const { trackReferralClick } = await import('../../lib/api/referrals');
    await trackReferralClick({ referralCode: 'ABC123', propertyId: 'prop-1' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/referrals/click`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ referralCode: 'ABC123', propertyId: 'prop-1' }),
      })
    );
  });

  it('trackReferralClick does not throw on network error', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network fail'));

    const { trackReferralClick } = await import('../../lib/api/referrals');
    await expect(trackReferralClick({ referralCode: 'X' })).resolves.toBeUndefined();
  });

  it('getReferralStats returns data on success', async () => {
    const statsData = { clicks: 10, signups: 2, conversionRate: 20, recentEvents: [] };
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: statsData }),
    });

    const { getReferralStats } = await import('../../lib/api/referrals');
    const stats = await getReferralStats();
    expect(stats).toEqual(statsData);
  });

  it('getReferralStats returns null on failure', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false });

    const { getReferralStats } = await import('../../lib/api/referrals');
    const stats = await getReferralStats();
    expect(stats).toBeNull();
  });
});
