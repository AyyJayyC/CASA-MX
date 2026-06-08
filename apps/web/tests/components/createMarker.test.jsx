import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock a minimal Leaflet interface for the helper
vi.mock('leaflet', () => {
  const handlersStore = [];
  const markerFactory = (coords) => {
    const handlers = {};
    const marker = {
      on: (evt, cb) => { handlers[evt] = cb; },
      bindPopup: vi.fn((content) => { marker._popup = content; }),
      _handlers: handlers
    };
    handlersStore.push(marker);
    return marker;
  };

  return {
    default: {
      marker: vi.fn((coords) => markerFactory(coords))
    },
    marker: vi.fn((coords) => markerFactory(coords))
  };
});

import createMarker from '../../components/map/createMarker.js';
import L from 'leaflet';

describe('createMarker helper', () => {
  let track;
  let router;
  let property;

  beforeEach(() => {
    track = vi.fn();
    router = { push: vi.fn() };
    property = { id: 'p1', lat: 19.43, lng: -99.13, title: 'Test A', address: 'Addr A' };

    // reset mocks
    L.marker.mockClear();
  });

  it('creates a marker and binds handlers', () => {
    const { marker, popupContent } = createMarker({ L, property, track, router });

    // L.marker called with coords
    expect(L.marker).toHaveBeenCalledWith([property.lat, property.lng]);

    // marker was returned and has handler map
    expect(marker._handlers).toBeDefined();

    // bindPopup should have been called with a DOM element
    expect(marker._popup).toBeDefined();
    expect(popupContent.querySelector('a').getAttribute('data-prop-id')).toEqual('p1');
  });

  it('invokes track on marker click and on popup link click triggers router.push', () => {
    const { marker, popupContent } = createMarker({ L, property, track, router });

    // simulate marker click
    const clickHandler = marker._handlers.click;
    expect(typeof clickHandler).toBe('function');
    clickHandler();
    expect(track).toHaveBeenCalledWith('PropertyViewed', expect.objectContaining({ entityId: 'p1' }));

    // simulate clicking the popup link
    const anchor = popupContent.querySelector('a');
    // fire event
    anchor.click();

    expect(track).toHaveBeenCalledWith('PropertyViewed', expect.objectContaining({ entityId: 'p1' }));
    expect(router.push).toHaveBeenCalledWith('/properties/p1');
  });
});
