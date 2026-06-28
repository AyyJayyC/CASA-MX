'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getComponent,
  normalizeAddressText,
  getMapsErrorMessage,
  getTypedStreetPrefix,
  buildGeocodeQueryFromSuggestion,
  normalizeSuggestionText,
} from '../../lib/address-utils';
import { logger } from '../../lib/logging/logger';

export default function AddressSection({
  register, errors, watch, setValue, getValues,
  inputClass, labelClass, errorClass,
  locationsCatalog,
}) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [activeAddressSuggestionIndex, setActiveAddressSuggestionIndex] = useState(-1);
  const addressSearchRef = useRef(null);
  const addressDebounce = useRef(null);
  const sessionTokenRef = useRef(null);
  const autocompleteCache = useRef(new Map());

  useEffect(() => {
    function handleClick(e) {
      if (addressSearchRef.current && !addressSearchRef.current.contains(e.target)) {
        setShowAddressSuggestions(false);
        setActiveAddressSuggestionIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      if (addressDebounce.current) {
        clearTimeout(addressDebounce.current);
      }
    };
  }, []);

  const selectedEstado = watch('estado');
  const selectedCiudad = watch('ciudad');
  const selectedColonia = watch('colonia');

  const estadosDisponibles = (locationsCatalog?.estados || []).map((e) => e?.nombre).filter(Boolean).sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const estadoCatalogo = (locationsCatalog?.estados || []).find(
    (e) => String(e?.nombre || '').toLowerCase() === String(selectedEstado || '').toLowerCase()
  );
  const ciudadesCatalogo = (estadoCatalogo?.ciudades || []).map((c) => c?.nombre).filter(Boolean);
  const ciudadesDisponibles = [...new Set([...ciudadesCatalogo, selectedCiudad].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const ciudadCatalogo = (estadoCatalogo?.ciudades || []).find(
    (c) => String(c?.nombre || '').toLowerCase() === String(selectedCiudad || '').toLowerCase()
  );
  const coloniasCatalogo = (ciudadCatalogo?.colonias || []).filter(Boolean);

  const coloniasDisponibles = [...new Set([...coloniasCatalogo, selectedColonia].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  useEffect(() => {
    if (selectedEstado) {
      const currentCiudad = getValues('ciudad');
      if (currentCiudad && !ciudadesCatalogo.includes(currentCiudad)) {
        setValue('ciudad', '', { shouldDirty: true });
      }
      const currentColonia = getValues('colonia');
      if (currentColonia && !coloniasCatalogo.includes(currentColonia)) {
        setValue('colonia', '', { shouldDirty: true });
      }
    } else {
      setValue('ciudad', '', { shouldDirty: true });
      setValue('colonia', '', { shouldDirty: true });
    }
  }, [selectedEstado]);

  const syncFullAddressFromLocation = useCallback(() => {
    const currentAddress = String(getValues('address') || '').trim();
    const estado = String(getValues('estado') || '').trim();
    const ciudad = String(getValues('ciudad') || '').trim();
    const colonia = String(getValues('colonia') || '').trim();
    const codigoPostal = String(getValues('codigoPostal') || '').trim();

    const locationParts = [colonia, ciudad, estado, codigoPostal ? `C.P. ${codigoPostal}` : '']
      .filter(Boolean)
      .join(', ');

    if (!locationParts) return;

    const previousParts = [
      String(getValues('colonia') || '').trim(),
      String(getValues('ciudad') || '').trim(),
      String(getValues('estado') || '').trim(),
      String(getValues('codigoPostal') || '').trim()
        ? `C.P. ${String(getValues('codigoPostal') || '').trim()}`
        : '',
    ]
      .filter(Boolean)
      .join(', ');

    let streetPart = currentAddress;
    if (previousParts) {
      const idx = currentAddress.toLowerCase().indexOf(previousParts.toLowerCase());
      if (idx >= 0) {
        streetPart = currentAddress.slice(0, idx).trim().replace(/,\s*$/, '');
      }
    }

    if (!streetPart && currentAddress.includes(',')) {
      streetPart = currentAddress.split(',')[0].trim();
    }

    const composedAddress = streetPart ? `${streetPart}, ${locationParts}` : locationParts;
    setValue('address', composedAddress, { shouldDirty: true });
    setAddressSearch(composedAddress);
  }, [getValues, setValue]);

  const inferLocationFromAddress = useCallback(() => {
    const rawAddress = String(getValues('address') || addressSearch || '').trim();
    if (!rawAddress) return;

    const normalizedAddress = normalizeAddressText(rawAddress);

    const currentCiudad = String(getValues('ciudad') || '').trim();
    if (!currentCiudad && ciudadesDisponibles.length > 0) {
      const detectedCiudad = ciudadesDisponibles.find((city) =>
        normalizedAddress.includes(normalizeAddressText(city))
      );
      if (detectedCiudad) {
        setValue('ciudad', detectedCiudad, { shouldDirty: true, shouldValidate: true });
      }
    }

    const currentColonia = String(getValues('colonia') || '').trim();
    if (!currentColonia && coloniasDisponibles.length > 0) {
      const detectedColonia = coloniasDisponibles.find((coloniaItem) =>
        normalizedAddress.includes(normalizeAddressText(coloniaItem))
      );
      if (detectedColonia) {
        setValue('colonia', detectedColonia, { shouldDirty: true, shouldValidate: true });
      }
    }

    const currentCp = String(getValues('codigoPostal') || '').trim();
    if (!currentCp) {
      const detectedCp = rawAddress.match(/\b\d{5}\b/)?.[0] || '';
      if (detectedCp) {
        setValue('codigoPostal', detectedCp, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [
    addressSearch,
    ciudadesDisponibles,
    coloniasDisponibles,
    getValues,
    setValue,
  ]);

  useEffect(() => {
    inferLocationFromAddress();
  }, [inferLocationFromAddress]);

  const fillFromGeocode = useCallback(async (description, typedInput = '', selectedSuggestion = null) => {
    try {
      const res = await fetch(`${BACKEND_URL}/maps/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address: description }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(getMapsErrorMessage(payload, 'No se pudo buscar la direccion.'));
      }

      const { result } = payload || {};
      if (!result) {
        throw new Error('No se obtuvo una ubicacion valida para esta direccion.');
      }

      setAddressSearchError('');

      if (result.address_components) {
        const comps = result.address_components;
        const streetNum = getComponent(comps, 'street_number');
        const route = getComponent(comps, 'route');
        const suggestionComponents = selectedSuggestion?.address_components || {};
        const cpFromFormatted = String(result.formatted_address || '').match(/\b\d{5}\b/)?.[0] || '';

        let colonia =
          getComponent(comps, 'sublocality_level_1') ||
          getComponent(comps, 'neighborhood') ||
          getComponent(comps, 'sublocality_level_2') ||
          getComponent(comps, 'sublocality') ||
          suggestionComponents.colonia || '';
        let ciudad =
          getComponent(comps, 'locality') ||
          getComponent(comps, 'postal_town') ||
          getComponent(comps, 'administrative_area_level_2') ||
          suggestionComponents.ciudad || '';
        let estado =
          getComponent(comps, 'administrative_area_level_1') ||
          suggestionComponents.estado || '';
        const cp = getComponent(comps, 'postal_code') || suggestionComponents.codigoPostal || cpFromFormatted || '';
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

        if (!colonia || !ciudad || !estado) {
          const faParts = (result.formatted_address || '').split(',').map(s => s.trim()).filter(Boolean);
          const idxMexico = faParts.findIndex(p => /mexico|mex|mx/i.test(p));
          const usable = idxMexico >= 0 ? faParts.slice(0, idxMexico) : faParts;
          if (usable.length >= 3) {
            if (!estado) estado = usable[usable.length - 1].trim();
            if (!ciudad) ciudad = usable[usable.length - 2].trim();
            if (!colonia) colonia = usable[usable.length - 3].trim();
          }
        }

        if (colonia && estado && colonia.toLowerCase() === estado.toLowerCase()) {
          const altColonia = getComponent(comps, 'neighborhood') ||
            getComponent(comps, 'sublocality_level_1') ||
            getComponent(comps, 'sublocality');
          if (altColonia && altColonia !== estado) colonia = altColonia;
        }

        const street = route && streetNum ? `${route} ${streetNum}` : route || streetNum;
        const typedStreet = getTypedStreetPrefix(typedInput || addressSearch, description);
        const streetHasNumber = /\d/.test(String(street || ''));
        const effectiveStreet = !streetHasNumber && typedStreet ? typedStreet : street;
        const locationParts = [colonia, ciudad, estado, cp ? `C.P. ${cp}` : ''].filter(Boolean).join(', ');
        const fullAddress = effectiveStreet
          ? `${effectiveStreet}, ${locationParts}`
          : typedStreet
            ? `${typedStreet}, ${locationParts || result.formatted_address || ''}`.replace(/,\s*$/, '')
            : (result.formatted_address || locationParts);

        setValue('address', fullAddress, { shouldDirty: true, shouldValidate: true });
        if (estado) setValue('estado', estado, { shouldDirty: true, shouldValidate: true });
        if (ciudad) setValue('ciudad', ciudad, { shouldDirty: true, shouldValidate: true });
        if (colonia) {
          setValue('colonia', colonia, { shouldDirty: true, shouldValidate: true });
        } else {
          setValue('colonia', '', { shouldDirty: true, shouldValidate: true });
        }
        if (cp) setValue('codigoPostal', cp, { shouldDirty: true, shouldValidate: true });
        if (lat) setValue('latitude', lat, { shouldDirty: true });
        if (lng) setValue('longitude', lng, { shouldDirty: true });
        setAddressSearch(fullAddress);
      } else if (result.display_name) {
        const typedStreet = getTypedStreetPrefix(typedInput || addressSearch, description || result.display_name);
        const suggestionComponents = selectedSuggestion?.address_components || {};
        const nomAddress = result.address || {};
        const cpFromDisplay = String(result.display_name || '').match(/\b\d{5}\b/)?.[0] || '';
        const estado = nomAddress.state || nomAddress.province || '';
        const ciudad = nomAddress.city || nomAddress.town || nomAddress.village || nomAddress.municipality || nomAddress.county || '';
        const colonia = nomAddress.neighbourhood || nomAddress.suburb || nomAddress.city_district || '';
        const cp = nomAddress.postcode || suggestionComponents.codigoPostal || cpFromDisplay || '';
        const locationParts = [colonia, ciudad, estado, cp ? `C.P. ${cp}` : ''].filter(Boolean).join(', ');
        const composedAddress = typedStreet
          ? `${typedStreet}, ${locationParts || result.display_name || ''}`.replace(/,\s*$/, '')
          : result.display_name;

        setValue('address', composedAddress, { shouldDirty: true, shouldValidate: true });
        const lat = result.lat ? Number(result.lat) : null;
        const lon = result.lon ? Number(result.lon) : null;

        if (estado || suggestionComponents.estado) setValue('estado', estado || suggestionComponents.estado, { shouldDirty: true, shouldValidate: true });
        if (ciudad || suggestionComponents.ciudad) setValue('ciudad', ciudad || suggestionComponents.ciudad, { shouldDirty: true, shouldValidate: true });
        if (colonia || suggestionComponents.colonia) {
          setValue('colonia', colonia || suggestionComponents.colonia, { shouldDirty: true, shouldValidate: true });
        } else {
          setValue('colonia', '', { shouldDirty: true, shouldValidate: true });
        }
        if (cp) setValue('codigoPostal', cp, { shouldDirty: true, shouldValidate: true });
        if (lat) setValue('latitude', lat, { shouldDirty: true });
        if (lon) setValue('longitude', lon, { shouldDirty: true });
        setAddressSearch(composedAddress);
      }
    } catch (e) {
      logger.logError(e, 'Geocode fill error');
      setAddressSearchError(e instanceof Error ? e.message : 'No se pudo buscar la direccion.');
    }
  }, [BACKEND_URL, setValue]);

  const getSuggestionDisplay = useCallback((suggestion) => {
    const structured = suggestion?.structured_formatting;
    const typedFirstSegment = String(addressSearch || '')
      .split(',')[0]
      .trim();

    const enforceTypedStreetNumber = (mainText) => {
      const main = String(mainText || '').trim();
      if (!typedFirstSegment || !/\d/.test(typedFirstSegment) || /\d/.test(main)) {
        return main;
      }

      const normalizedMain = normalizeSuggestionText(main);
      const normalizedTyped = normalizeSuggestionText(typedFirstSegment);

      if (normalizedTyped.startsWith(normalizedMain)) {
        return typedFirstSegment;
      }

      return main;
    };

    if (structured?.main_text) {
      return {
        main: enforceTypedStreetNumber(structured.main_text),
        secondary: structured.secondary_text || '',
      };
    }

    const description = String(suggestion?.description || '').trim();
    if (!description) {
      return { main: '', secondary: '' };
    }

    const [main, ...rest] = description.split(',').map((part) => part.trim()).filter(Boolean);
    return {
      main: enforceTypedStreetNumber(main || description),
      secondary: rest.join(', '),
    };
  }, [addressSearch]);

  const closeAddressSuggestions = useCallback(() => {
    setShowAddressSuggestions(false);
    setActiveAddressSuggestionIndex(-1);
  }, []);

  const openAddressSuggestions = useCallback(() => {
    if (!addressSuggestions.length) return;
    setShowAddressSuggestions(true);
    setActiveAddressSuggestionIndex((current) => {
      if (current >= 0 && current < addressSuggestions.length) {
        return current;
      }
      return 0;
    });
  }, [addressSuggestions]);

  const selectAddressSuggestion = useCallback(async (suggestion) => {
    const typed = addressSearch.trim();
    const query = buildGeocodeQueryFromSuggestion(typed, suggestion);
    closeAddressSuggestions();
    setAddressSuggestions([]);
    sessionTokenRef.current = null;
    await fillFromGeocode(query, typed, suggestion);
  }, [addressSearch, closeAddressSuggestions, fillFromGeocode]);

  const shouldShowAddressEmptyState =
    showAddressSuggestions &&
    addressSearch.trim().length >= 4 &&
    !addressSearchLoading &&
    !addressSearchError &&
    addressSuggestions.length === 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        Ubicación
      </h2>

      {/* Google Places Search */}
      <div className="relative max-w-full overflow-hidden" ref={addressSearchRef}>
        <label className={labelClass}>
          Buscar dirección <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={addressSearch}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showAddressSuggestions}
            aria-controls="address-suggestions-listbox"
            aria-activedescendant={
              activeAddressSuggestionIndex >= 0 ? `address-suggestion-${activeAddressSuggestionIndex}` : undefined
            }
            onChange={e => {
              const v = e.target.value;
              setAddressSearch(v);
              setAddressSearchError('');
              setValue('address', v);
              setShowAddressSuggestions(true);
              setActiveAddressSuggestionIndex(-1);
              clearTimeout(addressDebounce.current);
              if (v.length >= 4) {
                if (autocompleteCache.current.has(v)) {
                  const cached = autocompleteCache.current.get(v);
                  setAddressSuggestions(cached);
                  setActiveAddressSuggestionIndex(cached.length > 0 ? 0 : -1);
                  setAddressSearchLoading(false);
                  return;
                }
                setAddressSearchLoading(true);
                addressDebounce.current = setTimeout(async () => {
                  try {
                    if (!sessionTokenRef.current) {
                      sessionTokenRef.current = crypto.randomUUID();
                    }
                    const params = new URLSearchParams({ input: v, sessionToken: sessionTokenRef.current });
                    const r = await fetch(`${BACKEND_URL}/maps/autocomplete?${params}`, { credentials: 'include' });
                    const payload = await r.json().catch(() => null);
                    if (!r.ok) {
                      throw new Error(getMapsErrorMessage(payload, 'No se pudo autocompletar la direccion.'));
                    }
                    const { predictions } = payload || {};
                    autocompleteCache.current.set(v, predictions || []);
                    setAddressSuggestions(predictions || []);
                    setActiveAddressSuggestionIndex((predictions || []).length > 0 ? 0 : -1);
                    setAddressSearchError('');
                  } catch (error) {
                    setAddressSuggestions([]);
                    setActiveAddressSuggestionIndex(-1);
                    setAddressSearchError(error instanceof Error ? error.message : 'No se pudo autocompletar la direccion.');
                  } finally {
                    setAddressSearchLoading(false);
                  }
                }, 400);
              } else {
                setAddressSuggestions([]);
                setActiveAddressSuggestionIndex(-1);
                setAddressSearchError('');
                setAddressSearchLoading(false);
              }
            }}
            onFocus={() => {
              if (!sessionTokenRef.current) {
                sessionTokenRef.current = crypto.randomUUID();
              }
              openAddressSuggestions();
            }}
            onKeyDown={async (e) => {
              if (e.key === 'ArrowDown' && addressSuggestions.length > 0) {
                e.preventDefault();
                setShowAddressSuggestions(true);
                setActiveAddressSuggestionIndex((current) => {
                  const next = current < 0 ? 0 : current + 1;
                  return next >= addressSuggestions.length ? 0 : next;
                });
                return;
              }

              if (e.key === 'ArrowUp' && addressSuggestions.length > 0) {
                e.preventDefault();
                setShowAddressSuggestions(true);
                setActiveAddressSuggestionIndex((current) => {
                  if (current <= 0) return addressSuggestions.length - 1;
                  return current - 1;
                });
                return;
              }

              if (e.key === 'Escape') {
                closeAddressSuggestions();
                return;
              }

              if (e.key === 'Enter') {
                e.preventDefault();

                if (showAddressSuggestions && addressSuggestions.length > 0) {
                  const selectedSuggestion = addressSuggestions[
                    activeAddressSuggestionIndex >= 0 ? activeAddressSuggestionIndex : 0
                  ];

                  if (selectedSuggestion?.description) {
                    await selectAddressSuggestion(selectedSuggestion);
                    return;
                  }
                }

                if ((addressSearch || '').trim().length >= 4) {
                  closeAddressSuggestions();
                  setAddressSuggestions([]);
                  await fillFromGeocode(addressSearch.trim(), addressSearch.trim());
                }
              }
            }}
            placeholder="Ej: San Miguel de Horcasitas 36, Hermosillo"
            className={`${inputClass} truncate`}
          />
          {addressSearchLoading && (
            <div className="absolute right-3 top-3">
              <svg className="animate-spin h-4 w-4 text-clay-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
        {addressSearchError && (
          <p className={errorClass}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {addressSearchError}
          </p>
        )}
        {showAddressSuggestions && addressSuggestions.length > 0 && (
          <div
            id="address-suggestions-listbox"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto"
          >
            {addressSuggestions.map((s, i) => (
              <button
                key={s.place_id || i}
                id={`address-suggestion-${i}`}
                type="button"
                role="option"
                aria-selected={activeAddressSuggestionIndex === i}
                onMouseEnter={() => setActiveAddressSuggestionIndex(i)}
                onClick={async () => {
                  await selectAddressSuggestion(s);
                }}
                className={`w-full text-left px-4 py-3 text-sm border-b border-neutral-100 dark:border-neutral-700 last:border-0 transition-colors ${
                  activeAddressSuggestionIndex === i
                    ? 'bg-clay-50 dark:bg-clay-900/20'
                    : 'hover:bg-clay-50 dark:hover:bg-clay-900/20'
                }`}
              >
                {(() => {
                  const display = getSuggestionDisplay(s);
                  return (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-clay-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-neutral-800 dark:text-neutral-100 leading-5 truncate font-medium">
                          {display.main}
                        </p>
                        {display.secondary && (
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-4 truncate">
                            {display.secondary}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </button>
            ))}
          </div>
        )}
        {shouldShowAddressEmptyState && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 p-4">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              No encontramos sugerencias claras en Mexico para esa direccion.
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Agrega ciudad o estado para mejorar el resultado, por ejemplo: Hermosillo, Sonora.
            </p>
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className={labelClass}>
          Dirección completa <span className="text-neutral-400 text-xs font-normal">(auto-completada, editable)</span>
        </label>
        <input
          id="address"
          type="text"
          {...register('address', {
            onBlur: () => {
              inferLocationFromAddress();
              queueMicrotask(syncFullAddressFromLocation);
            },
          })}
          className={inputClass}
          placeholder="Se llena al buscar en Google Maps arriba"
        />
        {errors.address && (
          <p className={errorClass}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Location fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="estado" className={labelClass}>
            Estado
          </label>
          <input
            id="estado"
            list="estados-list"
            {...register('estado')}
            placeholder="Selecciona el estado"
            className={`${inputClass}`}
            autoComplete="off"
          />
          <datalist id="estados-list">
            {estadosDisponibles.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="ciudad" className={labelClass}>
            Ciudad
          </label>
          <input
            id="ciudad"
            list="ciudades-list"
            {...register('ciudad')}
            placeholder="Selecciona la ciudad"
            className={`${inputClass}`}
            autoComplete="off"
          />
          <datalist id="ciudades-list">
            {ciudadesDisponibles.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="colonia" className={labelClass}>
            Colonia
          </label>
          <input
            id="colonia"
            list="colonias-list"
            {...register('colonia', { onBlur: syncFullAddressFromLocation })}
            placeholder="Escribe o selecciona la colonia"
            className={`${inputClass}`}
            autoComplete="off"
          />
          <datalist id="colonias-list">
            {coloniasDisponibles.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="codigoPostal" className={labelClass}>
            Código Postal
          </label>
          <input
            id="codigoPostal"
            type="text"
            {...register('codigoPostal', { onBlur: syncFullAddressFromLocation })}
            className={inputClass}
            placeholder="Se llena automáticamente"
          />
        </div>
      </div>
    </div>
  );
}
