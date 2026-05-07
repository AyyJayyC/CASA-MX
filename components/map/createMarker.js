'use client';

/**
 * createMarker - small helper to create a Leaflet marker for a property
 * - keeps marker creation logic isolated so we can test it deterministically
 *
 * @param {Object} opts
 * @param {Object} opts.L - Leaflet namespace (injected for testability)
 * @param {Object} opts.property - property object { id, lat, lng, title, address }
 * @param {Function} opts.track - analytics track function
 * @param {Object} opts.router - router with push()
 *
 * @returns {Object} { marker, popupContent }
 */
export default function createMarker({ L, property, track, router }) {
  if (!L || !property) return {};

  const marker = L.marker([property.lat, property.lng]);

  // Click on marker tracks a property view
  marker.on('click', () => {
    try {
      track && track('PropertyViewed', { entityId: property.id, metadata: { title: property.title } });
    } catch (err) {
      // swallow analytics errors to avoid breaking UX
      // eslint-disable-next-line no-console
      console.error('createMarker track error:', err);
    }
  });

  // Create popup content and attach link handler
  const popupContent = document.createElement('div');
  popupContent.style.minWidth = '160px';

  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = '600';
  titleEl.textContent = property.title || 'Untitled';

  const addressEl = document.createElement('div');
  addressEl.style.fontSize = '12px';
  addressEl.style.color = '#666';
  addressEl.textContent = property.address || '';

  const linkEl = document.createElement('a');
  linkEl.href = `/properties/${property.id}`;
  linkEl.setAttribute('data-prop-id', property.id);
  linkEl.textContent = 'View details';

  popupContent.appendChild(titleEl);
  popupContent.appendChild(addressEl);
  popupContent.appendChild(linkEl);

  linkEl.addEventListener('click', (e) => {
    e.preventDefault();
    const id = e.currentTarget.getAttribute('data-prop-id');
    try {
      track && track('PropertyViewed', { entityId: id, metadata: { via: 'map.popup.link' } });
    } catch (err) {}
    router && router.push(`/properties/${id}`);
  });

  marker.bindPopup(popupContent);

  return { marker, popupContent };
}
