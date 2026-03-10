import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Analytics layer', () => {
  const STORAGE_KEY = 'analytics.events';

  beforeEach(() => {
    // Reset modules so env changes are picked up
    vi.resetModules();
    // Make sure storage is clean
    const { clear } = require('../../lib/storage/storage');
    clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends structured payload and persists event when enabled', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    // Import after setting env
    const analytics = require('../../lib/analytics');

    const mockProvider = { track: vi.fn().mockResolvedValue({ ok: true }) };
    analytics._setProviderForTests(mockProvider);

    const payload = await analytics.trackEvent('PropertyViewed', { entityId: 'prop-1', metadata: { foo: 'bar' } }, { userId: 'user-1', activeRole: 'seller' });

    expect(payload).toBeDefined();
    expect(payload.eventName).toBe('PropertyViewed');
    expect(payload.userId).toBe('user-1');

    // Provider called
    expect(mockProvider.track).toHaveBeenCalled();

    // Stored locally
    const events = analytics.getRecentEvents(10);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventName).toBe('PropertyViewed');
  });

  it('does not throw when analytics disabled', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false';
    const analytics = require('../../lib/analytics');

    // Should not throw
    const res = await analytics.trackEvent('TestEvent', { entityId: 'x' }, { userId: 'u' });
    expect(res).toBeNull();

    const events = analytics.getRecentEvents(10);
    expect(events.length).toBe(0);
  });
});
