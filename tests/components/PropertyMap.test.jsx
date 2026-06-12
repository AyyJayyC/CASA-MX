import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';

let PropertyMap;

// Mock leaflet to avoid DOM issues in JSDOM
vi.mock('leaflet', () => {
  // Simple mocking strategy with handler capture
  const handlers = [];
  const markerFactory = (coords) => {
    const h = {};
    const m = {
      on: (evt, cb) => {
        h[evt] = cb;
      },
      bindPopup: vi.fn((content) => {
        // expose clickable link if present
        if (content && content.querySelector) {
          const a = content.querySelector('a');
          if (a) {
            // store a reference to call later in tests
            h._popupLink = a;
          }
        }
      }),
      handlers: h
    };
    handlers.push(m);
    return m;
  };

  const m = {
    map: vi.fn(() => {
      const mm = { setView: vi.fn(() => mm), addLayer: vi.fn(), remove: vi.fn() };
      return mm;
    }),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn((coords) => markerFactory(coords)),
    markerClusterGroup: vi.fn(() => ({ addLayer: vi.fn(), addLayer: vi.fn() })),
    __getLastMarkerInstances: () => handlers
  };
  return {
    default: m,
    ...m
  };
});

// Prevent the real leaflet.markercluster from executing in the test env (it expects a global L)
vi.mock('leaflet.markercluster', () => ({}));
// Mock CSS imports that the component pulls in; these are not JS modules in JSDOM tests
vi.mock('leaflet/dist/leaflet.css', () => ({}), { virtual: true });
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}), { virtual: true });
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}), { virtual: true });

// Mock Next.js router used by the component
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/storage/storage', () => ({
  getItem: (k) => {
    if (k === 'properties') return [
      { id: 'p1', lat: 19.43, lng: -99.13, title: 'Test A', address: 'Addr A' },
      { id: 'p2', title: 'NoCoords' }
    ];
    return [];
  }
}));

const mockTrack = vi.fn();
vi.mock('@/lib/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: mockTrack }),
  default: () => ({ track: mockTrack })
}));

describe('PropertyMap', () => {
  beforeEach(async () => {
    mockTrack.mockClear();
    // Import after mocks are defined so the module picks up the mocked deps
    try {
      // Diagnostic: require leaflets and css separately to pin down failure
      try {
        require('leaflet');
         
        console.log('diagnostic: leaflet required OK');
      } catch (e) {
         
        console.error('diagnostic: leafet require failed', e);
      }

      try {
        require('leaflet/dist/leaflet.css');
         
        console.log('diagnostic: leaflet CSS required OK');
      } catch (e) {
         
        console.error('diagnostic: leaflet CSS require failed', e);
      }

      try {
        require('leaflet.markercluster');
         
        console.log('diagnostic: markercluster required OK');
      } catch (e) {
         
        console.error('diagnostic: markercluster require failed', e);
      }

      try {
        require('leaflet.markercluster/dist/MarkerCluster.css');
         
        console.log('diagnostic: markercluster CSS required OK');
      } catch (e) {
         
        console.error('diagnostic: markercluster CSS require failed', e);
      }

      // Use dynamic import so Vitest's ESM/JSX transforms are applied
      PropertyMap = (await import('../../components/map/PropertyMap.jsx')).default;
    } catch (err) {
      // Log for diagnostics during test runs
       
      console.error('Error importing PropertyMap:', err);
      throw err;
    }
  });

  it('renders map container', () => {
    render(<PropertyMap />);
    expect(screen.getByTestId('property-map')).toBeDefined();
  });


});
