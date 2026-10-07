import { describe, it, expect, vi, beforeAll } from 'vitest';

// Richer mock than the auth middleware test: NextResponse returns a cookies API
// so we can assert the cmx_ref cookie is set on the redirect.
vi.mock('next/server', () => {
  class Cookies {
    constructor() {
      this._cookies = new Map();
    }
    set(name, value, opts) {
      this._cookies.set(name, { value, ...opts });
    }
    get(name) {
      return this._cookies.get(name);
    }
  }
  function makeResponse(type, url) {
    return {
      type,
      url: url ? String(url) : undefined,
      headers: new Map(),
      cookies: new Cookies(),
    };
  }
  return {
    NextResponse: {
      redirect: vi.fn((url) => makeResponse('redirect', url)),
      next: vi.fn(() => makeResponse('next')),
    },
  };
});

function makeRequest(pathname, cookies = {}) {
  const url = `http://localhost:3000${pathname}`;
  const nextUrl = new URL(url);
  // NextRequest.nextUrl is a NextURL; give the plain URL a clone() for the test.
  nextUrl.clone = () => new URL(nextUrl.toString());
  return {
    nextUrl,
    url,
    cookies: {
      has: (name) => name in cookies,
      get: (name) => ({ value: cookies[name] }),
    },
    headers: { get: () => null, set: () => {}, forEach: () => {} },
  };
}

describe('middleware referral capture (?ref)', () => {
  let middleware;

  beforeAll(async () => {
    const mod = await vi.importActual('@/middleware.js');
    middleware = mod.middleware;
  });

  it('sets an HttpOnly cmx_ref cookie and redirects to the clean URL', () => {
    const res = middleware(makeRequest('/properties/abc?ref=AGENT9'));
    expect(res.type).toBe('redirect');
    const cookie = res.cookies.get('cmx_ref');
    expect(cookie.value).toBe('AGENT9');
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('lax');
    expect(cookie.path).toBe('/');
    expect(cookie.maxAge).toBe(60 * 60 * 24 * 30);
    // Clean URL: ref removed, path preserved.
    expect(res.url).toContain('/properties/abc');
    expect(res.url).not.toContain('ref=');
  });

  it('still accepts the legacy ?compartio param', () => {
    const res = middleware(makeRequest('/properties/abc?compartio=OLD1'));
    expect(res.type).toBe('redirect');
    expect(res.cookies.get('cmx_ref').value).toBe('OLD1');
    expect(res.url).not.toContain('compartio=');
  });

  it('passes through untouched when there is no ref', () => {
    const res = middleware(makeRequest('/properties/abc'));
    expect(res.type).toBe('next');
    expect(res.cookies.get('cmx_ref')).toBeUndefined();
  });
});
