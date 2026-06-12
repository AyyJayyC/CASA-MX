import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) =>
    React.createElement('a', { ...props, 'data-href': href }, children),
}));

vi.mock('@/lib/api/notifications', () => ({
  getNotifications: vi.fn(() => Promise.resolve({ notifications: [], unreadCount: 0 })),
  markAllNotificationsRead: vi.fn(() => Promise.resolve()),
}));

import { AuthContext } from '../../lib/auth/AuthContext.jsx';
import NavBar from '../../components/NavBar.jsx';
import DesktopNavLinks from '../../components/DesktopNavLinks.jsx';
import MobileMenu from '../../components/MobileMenu.jsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function Providers({ children }) {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
}

function makeAuthValue(overrides = {}) {
  return {
    isAuthenticated: false,
    user: null,
    loading: false,
    isHydrated: true,
    error: null,
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    switchRole: vi.fn(),
    ...overrides,
  };
}

const KNOWN_ROUTES = new Set([
  '/',
  '/properties',
  '/properties/map',
  '/properties/map/draw',
  '/properties/import',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/dashboard',
  '/dashboard/account',
  '/dashboard/agency',
  '/dashboard/applications',
  '/dashboard/contact-requests',
  '/dashboard/crm',
  '/dashboard/my-offers',
  '/dashboard/my-properties',
  '/dashboard/notifications',
  '/dashboard/offers',
  '/dashboard/rental-applications',
  '/dashboard/shared',
  '/admin',
  '/admin/approvals',
  '/admin/agencies',
  '/admin/analytics',
  '/admin/analytics/market',
  '/admin/properties',
  '/admin/carousel',
  '/admin/debug',
  '/admin/maps',
  '/settings',
  '/credits',
  '/reviews',
  '/requested',
  '/publish-property',
  '/upload',
  '/upload/sale',
  '/upload/rental',
  '/aviso-legal',
  '/terminos',
  '/cookie',
]);

describe('NavBar link integrity', () => {
  function collectLinks(container) {
    const anchors = container.querySelectorAll('a[data-href]');
    return Array.from(anchors).map((a) => a.getAttribute('data-href'));
  }

  it('all NavBar links point to known routes (unauthenticated)', () => {
    const authValue = makeAuthValue({ isAuthenticated: false });
    const { container } = render(
      React.createElement(
        AuthContext.Provider,
        { value: authValue },
        React.createElement(NavBar),
      ),
      { wrapper: Providers },
    );

    const links = collectLinks(container);
    for (const href of links) {
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });

  it('all NavBar links point to known routes (authenticated seller)', () => {
    const authValue = makeAuthValue({
      isAuthenticated: true,
      user: {
        id: 'u1',
        name: 'Test Seller',
        email: 'seller@test.com',
        activeRole: 'seller',
        officialIdVerified: true,
        officialIdUploaded: true,
        paidSubscriber: false,
        roles: [
          { type: 'seller', status: 'approved' },
          { type: 'buyer', status: 'approved' },
        ],
      },
    });
    const { container } = render(
      React.createElement(
        AuthContext.Provider,
        { value: authValue },
        React.createElement(NavBar),
      ),
      { wrapper: Providers },
    );

    const links = collectLinks(container);
    for (const href of links) {
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });

  it('all NavBar links point to known routes (admin user)', () => {
    const authValue = makeAuthValue({
      isAuthenticated: true,
      user: {
        id: 'u1',
        name: 'Admin',
        email: 'admin@test.com',
        activeRole: 'admin',
        officialIdVerified: true,
        officialIdUploaded: true,
        paidSubscriber: false,
        roles: [
          { type: 'admin', status: 'approved' },
          { type: 'buyer', status: 'approved' },
        ],
      },
    });
    const { container } = render(
      React.createElement(
        AuthContext.Provider,
        { value: authValue },
        React.createElement(NavBar),
      ),
      { wrapper: Providers },
    );

    const links = collectLinks(container);
    for (const href of links) {
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });
});

describe('DesktopNavLinks link integrity', () => {
  function renderDesktopNav(isAuthenticated, canPublish) {
    const { container } = render(
      React.createElement(DesktopNavLinks, {
        isAuthenticated,
        isAdminUser: false,
        showDebugUI: false,
        activeRole: 'buyer',
        canPublish,
        propertiesDropdownOpen: false,
        setPropertiesDropdownOpen: vi.fn(),
        isActivePath: () => false,
        pathname: '/',
      }),
    );
    return container;
  }

  it('all DesktopNavLinks hrefs are known routes', () => {
    const container = renderDesktopNav(true, true);
    const anchors = container.querySelectorAll('a[data-href]');
    for (const a of anchors) {
      const href = a.getAttribute('data-href');
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });
});

describe('MobileMenu link integrity', () => {
  function renderMobileMenu(isAuthenticated, isAdmin) {
    const { container } = render(
      React.createElement(MobileMenu, {
        isOpen: true,
        onClose: vi.fn(),
        isAuthenticated,
        isAdminUser: isAdmin,
        showDebugUI: false,
        showAuthenticated: isAuthenticated,
        user: isAuthenticated
          ? {
              id: 'u1',
              name: 'Test',
              email: 'test@test.com',
              activeRole: isAdmin ? 'admin' : 'buyer',
              officialIdVerified: false,
              officialIdUploaded: false,
              paidSubscriber: false,
              roles: [
                { type: isAdmin ? 'admin' : 'buyer', status: 'approved' },
              ],
            }
          : null,
        handleLogout: vi.fn(),
        isActivePath: () => false,
        pathname: '/',
        canPublish: false,
      }),
    );
    return container;
  }

  it('all MobileMenu hrefs are known routes (unauthenticated)', () => {
    const container = renderMobileMenu(false, false);
    const anchors = container.querySelectorAll('a[data-href]');
    for (const a of anchors) {
      const href = a.getAttribute('data-href');
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });

  it('all MobileMenu hrefs are known routes (authenticated)', () => {
    const container = renderMobileMenu(true, false);
    const anchors = container.querySelectorAll('a[data-href]');
    for (const a of anchors) {
      const href = a.getAttribute('data-href');
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });

  it('all MobileMenu hrefs are known routes (admin)', () => {
    const container = renderMobileMenu(true, true);
    const anchors = container.querySelectorAll('a[data-href]');
    for (const a of anchors) {
      const href = a.getAttribute('data-href');
      const basePath = href.split('?')[0];
      expect(KNOWN_ROUTES.has(basePath)).toBe(true);
    }
  });
});
