/**
 * Unified Mexico locations catalog
 * Merges static JSON with live backend filter-options data
 */
import localLocationsCatalog from '../data/mexican-locations.json';

import { BACKEND_URL } from './client';

export async function getFilterOptions() {
  try {
    const response = await fetch(`${BACKEND_URL}/properties/filter-options`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) return { estados: [], ciudades: {} };
    const data = await response.json();
    return data.data || { estados: [], ciudades: {} };
  } catch {
    return { estados: [], ciudades: {} };
  }
}

export async function getUnifiedCatalog() {
  const [filterOptions] = await Promise.allSettled([getFilterOptions()]);

  const backendData = filterOptions.status === 'fulfilled' ? filterOptions.value : { estados: [], ciudades: {} };
  const staticEstados = (localLocationsCatalog.estados || []).map(e => ({
    id: e.id,
    nombre: e.nombre,
    ciudades: (e.ciudades || []).map(c => ({
      id: c.id,
      nombre: c.nombre,
      colonias: c.colonias || [],
    })),
  }));

  if (backendData.estados && backendData.estados.length > 0) {
    for (const be of backendData.estados) {
      const name = be.nombre || be.name || '';
      const existing = staticEstados.find(
        s => s.nombre.toLowerCase() === name.toLowerCase()
      );
      if (!existing) {
        staticEstados.push({
          id: be.id || name.replace(/\s+/g, '_').toUpperCase(),
          nombre: name,
          ciudades: (be.ciudades || []).map(c => ({
            id: c.id || c.nombre || '',
            nombre: c.nombre || c.name || '',
            colonias: c.colonias || [],
          })),
        });
      } else if (be.ciudades) {
        for (const bc of be.ciudades) {
          const cityName = bc.nombre || bc.name || '';
          if (!existing.ciudades.find(
            c => c.nombre.toLowerCase() === cityName.toLowerCase()
          )) {
            existing.ciudades.push({
              id: bc.id || cityName.replace(/\s+/g, '_').toUpperCase(),
              nombre: cityName,
              colonias: bc.colonias || [],
            });
          }
        }
      }
    }
  }

  return {
    metadata: localLocationsCatalog.metadata,
    estados: staticEstados,
    postalCodeRanges: localLocationsCatalog.postalCodeRanges,
  };
}

export function getStaticCatalog() {
  return localLocationsCatalog;
}
