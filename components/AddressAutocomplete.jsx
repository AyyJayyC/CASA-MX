'use client';

/**
 * AddressAutocomplete Component
 * Purpose: Intelligent address input with offline data, history suggestions, and validation
 * Features: Dropdown suggestions, error/warning display, postal code validation
 */

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { getUnifiedCatalog } from '../lib/api/locations.js';
import {
  validateField,
} from '../lib/utils/addressValidation';
import {
  getCachedAddresses,
  searchAddressCache,
  addAddressToCache,
} from '../lib/services/addressCache';

export default function AddressAutocomplete({
  value = {},
  onChange = () => {},
  onValidationChange = () => {},
  showHistory = true,
}) {
  const [address, setAddress] = useState(value);
  const [suggestions, setSuggestions] = useState({
    estado: [],
    ciudad: [],
    colonia: [],
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [locationsCatalog, setLocationsCatalog] = useState(null);
  const [validation, setValidation] = useState({
    estado: { errors: [], warnings: [] },
    ciudad: { errors: [], warnings: [] },
    colonia: { errors: [], warnings: [] },
    codigoPostal: { errors: [], warnings: [] },
  });
  const [recentAddresses, setRecentAddresses] = useState([]);
  const dropdownRefs = useRef({});

  // Initialize recent addresses
  useEffect(() => {
    if (showHistory) {
      setRecentAddresses(getCachedAddresses().slice(0, 5));
    }
  }, [showHistory]);

  useEffect(() => {
    let active = true;

    (async () => {
      const catalog = await getUnifiedCatalog();
      if (active && catalog) {
        setLocationsCatalog(catalog);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        activeDropdown &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].contains(e.target)
      ) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const getStates = () => {
    return (locationsCatalog?.estados || []).map((e) => e?.nombre).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es-MX'));
  };

  const getCities = (estado) => {
    if (!estado) return [];
    const estadoCatalog = (locationsCatalog?.estados || []).find(
      (e) => String(e?.nombre || '').toLowerCase() === String(estado).toLowerCase()
    );
    return (estadoCatalog?.ciudades || []).map((c) => c?.nombre).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es-MX'));
  };

  const getColonias = (estado, ciudad) => {
    if (!estado || !ciudad) return [];
    const estadoCatalog = (locationsCatalog?.estados || []).find(
      (e) => String(e?.nombre || '').toLowerCase() === String(estado).toLowerCase()
    );
    const ciudadCatalog = (estadoCatalog?.ciudades || []).find(
      (c) => String(c?.nombre || '').toLowerCase() === String(ciudad).toLowerCase()
    );
    return (ciudadCatalog?.colonias || []).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es-MX'));
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...address, [field]: value };
    setAddress(updated);
    onChange(updated);

    // Validate field
    const result = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      [field]: result,
    }));

    // Update suggestions based on field
    if (field === 'estado' && value) {
      setSuggestions(prev => ({
        ...prev,
        estado: getStates().filter(e =>
          e.toLowerCase().includes(value.toLowerCase())
        ),
        ciudad: getCities(value),
      }));
    } else if (field === 'ciudad' && updated.estado) {
      setSuggestions(prev => ({
        ...prev,
        ciudad: getCities(updated.estado).filter(c =>
          c.toLowerCase().includes(value.toLowerCase())
        ),
        colonia: getColonias(updated.estado, value),
      }));
    } else if (field === 'colonia' && updated.estado && updated.ciudad) {
      setSuggestions(prev => ({
        ...prev,
        colonia: getColonias(updated.estado, updated.ciudad).filter(
          c => c.toLowerCase().includes(value.toLowerCase())
        ),
      }));
    }

    onValidationChange(result);
  };

  const selectSuggestion = (field, value) => {
    handleFieldChange(field, value);
    setActiveDropdown(null);
  };

  const selectRecentAddress = (addr) => {
    setAddress(addr);
    onChange(addr);
    addAddressToCache(addr);
  };

  const renderFieldErrors = (field) => {
    const v = validation[field];
    if (!v.errors.length && !v.warnings.length) return null;

    return (
      <div className="mt-2 space-y-1">
        {v.errors.map((err, i) => (
          <div key={`err-${i}`} className="text-red-600 text-sm flex items-center gap-1">
            <span>❌</span> {err}
          </div>
        ))}
        {v.warnings.map((warn, i) => (
          <div key={`warn-${i}`} className="text-clay-600 text-sm flex items-center gap-1">
            <span>⚠️</span> {warn}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Recent Addresses */}
      {showHistory && recentAddresses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-semibold text-blue-900 mb-2">Recent addresses:</p>
          <div className="flex flex-wrap gap-2">
            {recentAddresses.map((addr, idx) => (
              <button
                key={idx}
                onClick={() => selectRecentAddress(addr)}
                className="text-sm px-3 py-1 bg-white border border-blue-300 rounded hover:bg-blue-50 transition"
              >
                {addr.colonia}, {addr.ciudad}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estado (State) */}
      <div ref={el => (dropdownRefs.current.estado = el)}>
        <label className="block text-sm font-medium mb-1">
          Estado <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={address.estado || ''}
            onChange={e => handleFieldChange('estado', e.target.value)}
            onFocus={() => setActiveDropdown('estado')}
            placeholder="e.g., Ciudad de México"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {activeDropdown === 'estado' && suggestions.estado.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.estado.map(s => (
                <button
                  key={s}
                  onClick={() => selectSuggestion('estado', s)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {renderFieldErrors('estado')}
      </div>

      {/* Ciudad (City) */}
      <div ref={el => (dropdownRefs.current.ciudad = el)}>
        <label className="block text-sm font-medium mb-1">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={address.ciudad || ''}
            onChange={e => handleFieldChange('ciudad', e.target.value)}
            onFocus={() => setActiveDropdown('ciudad')}
            placeholder="e.g., Benito Juárez"
            disabled={!address.estado}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {activeDropdown === 'ciudad' && suggestions.ciudad.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.ciudad.map(s => (
                <button
                  key={s}
                  onClick={() => selectSuggestion('ciudad', s)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {renderFieldErrors('ciudad')}
      </div>

      {/* Colonia (Neighborhood) */}
      <div ref={el => (dropdownRefs.current.colonia = el)}>
        <label className="block text-sm font-medium mb-1">
          Colonia <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={address.colonia || ''}
            onChange={e => handleFieldChange('colonia', e.target.value)}
            onFocus={() => setActiveDropdown('colonia')}
            placeholder="e.g., Del Valle"
            disabled={!address.estado || !address.ciudad}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {activeDropdown === 'colonia' && suggestions.colonia.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.colonia.map(s => (
                <button
                  key={s}
                  onClick={() => selectSuggestion('colonia', s)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {renderFieldErrors('colonia')}
      </div>

      {/* Código Postal (Postal Code) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Código Postal (optional)
        </label>
        <input
          type="text"
          value={address.codigoPostal || ''}
          onChange={e => handleFieldChange('codigoPostal', e.target.value)}
          placeholder="e.g., 06500"
          maxLength="5"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {renderFieldErrors('codigoPostal')}
      </div>

      {/* Info message */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        ℹ️ All locations are verified against official Mexican administrative data. If you don't see your neighborhood, please type it in - it will still be saved.
      </div>
    </div>
  );
}
