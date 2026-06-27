import { vi } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ type: 'redirect', url: url.toString() })),
    next: vi.fn(() => ({
      headers: new Map(),
      type: 'next',
    })),
  },
}));

const MockHeaders = class {
  constructor() {
    this._headers = new Map();
    this._set = new Map();
  }
  get(name) {
    return this._headers.get(name) || null;
  }
  set(name, value) {
    this._set.set(name, value);
  }
  forEach(_callback) {}
};

function makeToken(expiresInSeconds = 3600) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: '123',
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }));
  return `${header}.${payload}.signature`;
}

function expiredToken() {
  return makeToken(-3600);
}

describe('Middleware', () => {
  let middleware;

  beforeAll(async () => {
    const mod = await vi.importActual('@/middleware.js');
    middleware = mod.middleware;
  });

  function makeRequest(pathname, cookies = {}) {
    const url = `http://localhost:3000${pathname}`;
    return {
      nextUrl: new URL(url),
      url,
      cookies: {
        has: (name) => name in cookies,
        get: (name) => ({ value: cookies[name] }),
      },
      headers: new MockHeaders(),
    };
  }

  describe('Protected routes redirect unauthenticated users', () => {
    const protectedPaths = [
      '/dashboard',
      '/dashboard/account',
      '/dashboard/my-properties',
      '/admin',
      '/admin/approvals',
      '/admin/properties',
      '/publish-property',
      '/settings',
      '/settings/account',
      '/credits',
      '/reviews',
      '/upload',
      '/upload/sale',
      '/requested',
      '/notifications',
    ];

    for (const path of protectedPaths) {
      it(`redirects ${path} to /login`, () => {
        const req = makeRequest(path);
        const res = middleware(req);
        expect(res.type).toBe('redirect');
        expect(res.url).toContain('/login');
        expect(res.url).toContain(`redirect=${encodeURIComponent(path)}`);
      });
    }
  });

  describe('Authenticated users pass through protected routes', () => {
    it('allows authenticated user to /dashboard', () => {
      const req = makeRequest('/dashboard', { accessToken: makeToken() });
      const res = middleware(req);
      expect(res.type).toBe('next');
    });

    it('allows authenticated user to /admin/approvals', () => {
      const req = makeRequest('/admin/approvals', { refreshToken: 'test-refresh' });
      const res = middleware(req);
      expect(res.type).toBe('next');
    });
  });

  describe('Public-only routes redirect authenticated users', () => {
    const publicPaths = ['/login', '/register', '/forgot-password'];

    for (const path of publicPaths) {
      it(`redirects authenticated user from ${path} to /dashboard`, () => {
        const req = makeRequest(path, { accessToken: makeToken() });
        const res = middleware(req);
        expect(res.type).toBe('redirect');
        expect(res.url).toContain('/dashboard');
      });
    }
  });

  describe('Expired token handling', () => {
    it('treats expired accessToken as unauthenticated on protected route', () => {
      const req = makeRequest('/dashboard', { accessToken: expiredToken() });
      const res = middleware(req);
      expect(res.type).toBe('redirect');
      expect(res.url).toContain('/login');
    });

    it('treats expired accessToken as unauthenticated on public-only route', () => {
      const req = makeRequest('/login', { accessToken: expiredToken() });
      const res = middleware(req);
      expect(res.type).toBe('next');
    });

    it('still allows through if refreshToken exists even with expired accessToken', () => {
      const req = makeRequest('/dashboard', {
        accessToken: expiredToken(),
        refreshToken: 'valid-refresh',
      });
      const res = middleware(req);
      expect(res.type).toBe('next');
    });

    it('redirects expired + no refresh from public-only route', () => {
      const req = makeRequest('/login', { accessToken: expiredToken() });
      const res = middleware(req);
      expect(res.type).toBe('next');
    });
  });

  describe('Public pages are accessible without auth', () => {
    const publicPages = [
      '/',
      '/properties',
      '/properties/123',
      '/aviso-legal',
      '/terminos',
      '/cookie',
      '/properties/map',
    ];

    for (const path of publicPages) {
      it(`allows ${path} without auth`, () => {
        const req = makeRequest(path);
        const res = middleware(req);
        expect(res.type).toBe('next');
      });
    }
  });
});
