'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useRouter } from 'next/navigation';
import useAnalytics from '@/lib/analytics/useAnalytics';
import { getItem } from '@/lib/storage/storage';
import createMarker from './createMarker';

export default function PropertyMap({ center = [19.4326, -99.1332], zoom = 6 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const router = useRouter();
  const { track } = useAnalytics();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const properties = getItem('properties') || [];
    const markers = L.markerClusterGroup();

    properties.forEach((p) => {
      if (!p.lat || !p.lng) return; // gracefully ignore missing coords
      const { marker } = createMarker({ L, property: p, track, router });
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, track, router]);

  return (
    <div className="w-full h-[600px] border rounded overflow-hidden">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} data-testid="property-map" />
    </div>
  );
}
