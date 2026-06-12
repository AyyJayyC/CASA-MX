import { vi } from 'vitest';

let apiProvider;
let consoleProvider;

beforeAll(async () => {
  globalThis.fetch = vi.fn();
  globalThis.console = { ...globalThis.console, info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  apiProvider = await vi.importActual('@/lib/analytics/providers/apiProvider');
  consoleProvider = await vi.importActual('@/lib/analytics/providers/consoleProvider');
});

describe('API analytics provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has name api', () => {
    expect(apiProvider.name).toBe('api');
  });

  it('track sends POST to backend', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true });
    const result = await apiProvider.track({
      eventName: 'page_view',
      timestamp: '2024-01-01',
      activeRole: 'buyer',
    });
    expect(result.ok).toBe(true);
  });

  it('track handles non-ok response', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 500 });
    const result = await apiProvider.track({ eventName: 'test' });
    expect(result.ok).toBe(false);
  });

  it('track catches fetch errors', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network'));
    const result = await apiProvider.track({ eventName: 'test' });
    expect(result.ok).toBe(false);
  });

  it('flush resolves immediately', async () => {
    await expect(apiProvider.flush()).resolves.toBeUndefined();
  });
});

describe('Console analytics provider', () => {
  it('has name console', () => {
    expect(consoleProvider.name).toBe('console');
  });

  it('track returns ok', async () => {
    const result = await consoleProvider.track({ eventName: 'test' });
    expect(result.ok).toBe(true);
  });

  it('flush resolves immediately', async () => {
    await expect(consoleProvider.flush()).resolves.toBeUndefined();
  });
});
