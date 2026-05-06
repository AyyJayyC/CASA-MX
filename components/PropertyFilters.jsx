'use client';

import React, { useEffect, useState } from 'react';
import { getLocationsCatalog } from '../lib/api/properties';
import { getValidEstados, getCitiesForEstado, getColoniasForCity } from '../lib/utils/addressValidation';

export default function PropertyFilters({ onFilterChange, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    estado: initialFilters.estado || '',
    ciudad: initialFilters.ciudad || '',
    colonia: initialFilters.colonia || '',
    codigoPostal: initialFilters.codigoPostal || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
  });

  const [filterOptions, setFilterOptions] = useState({
    estados: [],
    ciudadesPorEstado: {},
    coloniasPorEstadoCiudad: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const catalog = await getLocationsCatalog();

        const estadosFallback = getValidEstados();
        const estadosCatalog = (catalog?.estados || []).map((e) => e?.nombre).filter(Boolean);
        const estados = [...new Set([...estadosFallback, ...estadosCatalog])].sort((a, b) =>
          a.localeCompare(b, 'es-MX')
        );

        const ciudadesPorEstado = {};
        const coloniasPorEstadoCiudad = {};

        estados.forEach((estado) => {
          const estadoCatalog = (catalog?.estados || []).find(
            (e) => String(e?.nombre || '').toLowerCase() === String(estado).toLowerCase()
          );

          const ciudadesCatalog = (estadoCatalog?.ciudades || []).map((c) => c?.nombre).filter(Boolean);
          const ciudadesFallback = getCitiesForEstado(estado);
          const ciudades = [...new Set([...ciudadesFallback, ...ciudadesCatalog])].sort((a, b) =>
            a.localeCompare(b, 'es-MX')
          );
          ciudadesPorEstado[estado] = ciudades;

          ciudades.forEach((ciudad) => {
            const ciudadCatalog = (estadoCatalog?.ciudades || []).find(
              (c) => String(c?.nombre || '').toLowerCase() === String(ciudad).toLowerCase()
            );
            const coloniasCatalog = (ciudadCatalog?.colonias || []).filter(Boolean);
            const coloniasFallback = getColoniasForCity(estado, ciudad);
            const colonias = [...new Set([...coloniasFallback, ...coloniasCatalog])].sort((a, b) =>
              a.localeCompare(b, 'es-MX')
            );
            coloniasPorEstadoCiudad[`${estado}::${ciudad}`] = colonias;
          });
        });

        setFilterOptions({
          estados,
          ciudadesPorEstado,
          coloniasPorEstadoCiudad,
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Error loading filter options');
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    const nuevosFiltros = {
      ...filters,
      estado: nuevoEstado,
      ciudad: '', // Reset ciudad when estado changes
      colonia: '', // Reset colonia when estado changes
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleCiudadChange = (e) => {
    const nuevosFiltros = {
      ...filters,
      ciudad: e.target.value,
      colonia: '', // Reset colonia when ciudad changes
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleColoniaChange = (e) => {
    const nuevosFiltros = {
      ...filters,
      colonia: e.target.value,
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleCodigoPostalChange = (e) => {
    const value = e.target.value;
    // Only allow digits, max 5
    if (!/^\d{0,5}$/.test(value)) return;
    const nuevosFiltros = {
      ...filters,
      codigoPostal: value,
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleMinPriceChange = (e) => {
    const nuevosFiltros = {
      ...filters,
      minPrice: e.target.value,
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleMaxPriceChange = (e) => {
    const nuevosFiltros = {
      ...filters,
      maxPrice: e.target.value,
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleClearFilters = () => {
    const nuevosFiltros = {
      estado: '',
      ciudad: '',
      colonia: '',
      codigoPostal: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const ciudadesDisponibles =
    filters.estado && filterOptions.ciudadesPorEstado[filters.estado]
      ? filterOptions.ciudadesPorEstado[filters.estado]
      : [];

  const coloniasDisponibles =
    filters.estado && filters.ciudad
      ? filterOptions.coloniasPorEstadoCiudad[`${filters.estado}::${filters.ciudad}`] || []
      : [];

  const hasActiveFilters =
    filters.estado ||
    filters.ciudad ||
    filters.colonia ||
    filters.codigoPostal ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Filtros de Búsqueda</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          Error cargando opciones de filtro: {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Cargando opciones de filtro...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Estado (Required) */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="estado"
              value={filters.estado}
              onChange={handleEstadoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar estado...</option>
              {filterOptions.estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* Ciudad (Cascading) */}
          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <select
              id="ciudad"
              value={filters.ciudad}
              onChange={handleCiudadChange}
              disabled={!filters.estado}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Seleccionar ciudad...</option>
              {ciudadesDisponibles.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* Colonia (Cascading) */}
          <div>
            <label htmlFor="colonia" className="block text-sm font-medium text-gray-700 mb-1">
              Colonia / Delegación
            </label>
            <select
              id="colonia"
              value={filters.colonia}
              onChange={handleColoniaChange}
              disabled={!filters.estado || !filters.ciudad}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Seleccionar colonia...</option>
              {coloniasDisponibles.map((colonia) => (
                <option key={colonia} value={colonia}>
                  {colonia}
                </option>
              ))}
            </select>
          </div>

          {/* Código Postal */}
          <div>
            <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              id="codigoPostal"
              type="text"
              value={filters.codigoPostal}
              onChange={handleCodigoPostalChange}
              placeholder="Ej: 06700"
              maxLength="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Mínimo (MXN)
            </label>
            <input
              id="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={handleMinPriceChange}
              placeholder="Ej: 500000"
              min="0"
              step="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Máximo (MXN)
            </label>
            <input
              id="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="Ej: 5000000"
              min="0"
              step="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Limpiar Filtros
        </button>
        <div className="flex-1"></div>
        {hasActiveFilters && (
          <p className="text-sm text-gray-600 self-center">
            {Object.values(filters).filter(Boolean).length} filtro(s) activo(s)
          </p>
        )}
      </div>
    </div>
  );
}
