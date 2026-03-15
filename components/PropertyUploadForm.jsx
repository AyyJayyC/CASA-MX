/**
 * PropertyUploadForm (client)
 * Purpose: Form for sellers/wholesalers to upload a property.
 * Design: Clean, minimalist form with gold accents and clear validation
 * Uses React Hook Form + Zod for validation. Submissions go to backend via `addProperty`.
 */
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, propertyFormDefaults } from '../lib/validation/propertySchema';
import { addProperty as addPropertyAPI } from '../lib/api/properties';
import { useInvalidateProperties } from '../lib/queries/properties';
import { addAddressToCache } from '../lib/services/addressCache';
import AddressAutocomplete from './AddressAutocomplete';
import Link from 'next/link';

/**
 * @returns {JSX.Element}
 */
export default function PropertyUploadForm() {
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressSearchRef = useRef(null);
  const addressDebounce = useRef(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e) {
      if (addressSearchRef.current && !addressSearchRef.current.contains(e.target)) {
        setShowAddressSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const invalidateProperties = useInvalidateProperties();

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: propertyFormDefaults,
    resolver: zodResolver(propertySchema)
  });

  const getComponent = (components, type) =>
    components?.find(c => c.types?.includes(type))?.long_name || '';

  const fillFromGeocode = useCallback(async (description) => {
    try {
      const res = await fetch(`${BACKEND_URL}/maps/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: description }),
      });
      const { result } = await res.json();
      if (!result) return;

      if (result.address_components) {
        // Google Maps result
        const comps = result.address_components;
        const streetNum = getComponent(comps, 'street_number');
        const route = getComponent(comps, 'route');
        const colonia =
          getComponent(comps, 'sublocality_level_1') ||
          getComponent(comps, 'neighborhood') ||
          getComponent(comps, 'sublocality');
        const ciudad =
          getComponent(comps, 'locality') ||
          getComponent(comps, 'administrative_area_level_2');
        const estado = getComponent(comps, 'administrative_area_level_1');
        const cp = getComponent(comps, 'postal_code');
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

        const street = route && streetNum ? `${route} ${streetNum}` : route || streetNum;
        const locationParts = [colonia, ciudad, estado, cp ? `C.P. ${cp}` : ''].filter(Boolean).join(', ');
        const fullAddress = street ? `${street}, ${locationParts}` : (result.formatted_address || locationParts);

        setValue('address', fullAddress);
        if (estado) setValue('estado', estado);
        if (ciudad) setValue('ciudad', ciudad);
        if (colonia) setValue('colonia', colonia);
        if (cp) setValue('codigoPostal', cp);
        if (lat) setValue('latitude', lat);
        if (lng) setValue('longitude', lng);
        setAddressSearch(fullAddress);
      } else if (result.display_name) {
        // Nominatim fallback
        setValue('address', result.display_name);
        const nomAddress = result.address || {};
        const estado = nomAddress.state || nomAddress.province || '';
        const ciudad = nomAddress.city || nomAddress.town || nomAddress.village || nomAddress.county || '';
        const colonia = nomAddress.neighbourhood || nomAddress.suburb || '';
        const cp = nomAddress.postcode || '';
        const lat = result.lat ? Number(result.lat) : null;
        const lon = result.lon ? Number(result.lon) : null;

        if (estado) setValue('estado', estado);
        if (ciudad) setValue('ciudad', ciudad);
        if (colonia) setValue('colonia', colonia);
        if (cp) setValue('codigoPostal', cp);
        if (lat) setValue('latitude', lat);
        if (lon) setValue('longitude', lon);
        setAddressSearch(result.display_name);
      }
    } catch (e) {
      console.error('Geocode fill error:', e);
    }
  }, [BACKEND_URL, setValue]);

  async function onSubmit(values) {
    try {
      setLoading(true);
      
      // Get token from localStorage (assuming it was stored during login)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const payload = {
        ...values,
        uploadedBy: { id: 'user-demo', name: 'Demo Seller' }
      };

      // Call real backend API
      const created = await addPropertyAPI(payload, token);

      // Save address to cache for future suggestions
      const addressData = {
        estado: values.estado,
        ciudad: values.ciudad,
        colonia: values.colonia,
        codigoPostal: values.codigoPostal,
      };
      addAddressToCache(addressData);

      setSuccess(created);
      reset(propertyFormDefaults);

      // Invalidate properties cache to trigger refetch in PropertyList
      invalidateProperties();

      // Scroll to success message
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error publishing property:', error);
      alert('Error al publicar la propiedad: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  // Input class shared across all fields
  const inputClass = `
    w-full px-4 py-2.5
    bg-white dark:bg-neutral-950
    border border-neutral-300 dark:border-neutral-700
    rounded-lg
    text-neutral-900 dark:text-neutral-100
    placeholder:text-neutral-500
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
    transition-shadow
  `;

  const labelClass = `
    block text-sm font-medium 
    text-neutral-700 dark:text-neutral-300 
    mb-2
  `;

  const errorClass = `
    text-sm text-red-500 dark:text-red-400 
    mt-1 
    flex items-center gap-1
  `;

  return (
    <>
      {/* Success Message */}
      {success && (
        <div className="
          mb-6 p-4
          bg-green-50 dark:bg-green-900/20
          border border-green-200 dark:border-green-800
          rounded-lg
        ">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                ¡Propiedad publicada exitosamente!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                {success.title} (ID: {success.id})
              </p>
              <Link 
                href={`/properties/${success.id}`}
                className="
                  inline-flex items-center gap-2
                  text-sm font-medium
                  text-green-700 dark:text-green-400
                  hover:text-green-800 dark:hover:text-green-300
                  transition-colors
                "
              >
                Ver propiedad publicada
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Información básica
          </h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Título de la propiedad *
            </label>
            <input 
              id="title" 
              type="text"
              {...register('title')} 
              className={inputClass}
              placeholder="Ej: Casa en venta en Polanco"
            />
            {errors.title && (
              <p className={errorClass}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Descripción *
            </label>
            <textarea 
              id="description" 
              rows={5}
              {...register('description')} 
              className={inputClass}
              placeholder="Describe las características y ventajas de la propiedad..."
            />
            {errors.description && (
              <p className={errorClass}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price and Square Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className={labelClass}>
                Precio (MXN) *
              </label>
              <input 
                id="price" 
                type="number"
                {...register('price', { valueAsNumber: true })} 
                className={inputClass}
                placeholder="0"
              />
              {errors.price && (
                <p className={errorClass}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="squareMeters" className={labelClass}>
                Metros cuadrados *
              </label>
              <input 
                id="squareMeters" 
                type="number"
                {...register('squareMeters', { valueAsNumber: true })} 
                className={inputClass}
                placeholder="0"
              />
              {errors.squareMeters && (
                <p className={errorClass}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.squareMeters.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Ubicación
          </h2>

          {/* Google Places Search */}
          <div className="relative" ref={addressSearchRef}>
            <label className={labelClass}>
              Buscar dirección <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={addressSearch}
                onChange={e => {
                  const v = e.target.value;
                  setAddressSearch(v);
                  setValue('address', v);
                  setShowAddressSuggestions(true);
                  clearTimeout(addressDebounce.current);
                  if (v.length >= 4) {
                    setAddressSearchLoading(true);
                    addressDebounce.current = setTimeout(async () => {
                      try {
                        const r = await fetch(`${BACKEND_URL}/maps/autocomplete?input=${encodeURIComponent(v)}`);
                        const { predictions } = await r.json();
                        setAddressSuggestions(predictions || []);
                      } catch {
                        setAddressSuggestions([]);
                      } finally {
                        setAddressSearchLoading(false);
                      }
                    }, 400);
                  } else {
                    setAddressSuggestions([]);
                    setAddressSearchLoading(false);
                  }
                }}
                onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                placeholder="Ej: San Miguel de Horcasitas 36, Hermosillo"
                className={inputClass}
              />
              {addressSearchLoading && (
                <div className="absolute right-3 top-3">
                  <svg className="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            {showAddressSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {addressSuggestions.map((s, i) => (
                  <button
                    key={s.place_id || i}
                    type="button"
                    onClick={async () => {
                      setShowAddressSuggestions(false);
                      setAddressSuggestions([]);
                      await fillFromGeocode(s.description);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-neutral-100 dark:border-neutral-700 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-neutral-700 dark:text-neutral-300">{s.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual override — pre-filled from search, editable */}
          <AddressAutocomplete
            value={{
              estado: watch('estado'),
              ciudad: watch('ciudad'),
              colonia: watch('colonia'),
              codigoPostal: watch('codigoPostal'),
            }}
            onChange={(addressData) => {
              if (addressData.estado !== undefined) setValue('estado', addressData.estado);
              if (addressData.ciudad !== undefined) setValue('ciudad', addressData.ciudad);
              if (addressData.colonia !== undefined) setValue('colonia', addressData.colonia);
              if (addressData.codigoPostal !== undefined) setValue('codigoPostal', addressData.codigoPostal);

              // Auto-compose the full address field when location parts are all present
              const estado = addressData.estado ?? watch('estado');
              const ciudad = addressData.ciudad ?? watch('ciudad');
              const colonia = addressData.colonia ?? watch('colonia');
              const cp = addressData.codigoPostal ?? watch('codigoPostal');
              if (estado && ciudad && colonia) {
                // Preserve whatever the user typed as the street prefix
                const currentAddress = watch('address') || '';
                // Strip any previously auto-composed location suffix so we don't duplicate it
                const prevColonia = watch('colonia');
                const prevCiudad = watch('ciudad');
                const prevEstado = watch('estado');
                const autoSuffixPattern = new RegExp(
                  ',?\\s*' + [prevColonia, prevCiudad, prevEstado].filter(Boolean).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'),
                  'i'
                );
                const streetPart = currentAddress ? currentAddress.replace(autoSuffixPattern, '').trim().replace(/,\s*$/, '') : '';
                const locationParts = [colonia, ciudad, estado, cp ? `C.P. ${cp}` : ''].filter(Boolean).join(', ');
                const composed = streetPart ? `${streetPart}, ${locationParts}` : locationParts;
                setValue('address', composed);
              }
            }}
            onValidationChange={() => {}}
            showHistory={true}
          />

          {/* Address */}
          <div>
            <label htmlFor="address" className={labelClass}>
              Dirección completa <span className="text-neutral-400 text-xs font-normal">(auto-completada, editable)</span>
            </label>
            <input 
              id="address" 
              type="text"
              {...register('address')} 
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
        </div>

        {/* Property Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Detalles de la propiedad
          </h2>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Tipo de propiedad *
            </label>
            <input 
              id="propertyType" 
              type="text"
              {...register('propertyType')} 
              className={inputClass}
              placeholder="Ej: Casa, Departamento, Terreno"
            />
            {errors.propertyType && (
              <p className={errorClass}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.propertyType.message}
              </p>
            )}
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedrooms" className={labelClass}>
                Recámaras
              </label>
              <input 
                id="bedrooms" 
                type="number"
                {...register('bedrooms', { valueAsNumber: true })} 
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className={labelClass}>
                Baños
              </label>
              <input 
                id="bathrooms" 
                type="number"
                {...register('bathrooms', { valueAsNumber: true })} 
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Financing Options Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Opciones de financiamiento
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                id="fin_cash" 
                type="checkbox" 
                {...register('financeOptions.cash')}
                className="
                  w-4 h-4
                  text-amber-600
                  border-neutral-300 dark:border-neutral-700
                  rounded
                  focus:ring-2 focus:ring-amber-400
                "
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                Efectivo
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                id="fin_bank" 
                type="checkbox" 
                {...register('financeOptions.bankLoan')}
                className="
                  w-4 h-4
                  text-amber-600
                  border-neutral-300 dark:border-neutral-700
                  rounded
                  focus:ring-2 focus:ring-amber-400
                "
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                Crédito bancario
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                id="fin_infonavit" 
                type="checkbox" 
                {...register('financeOptions.INFONAVIT')}
                className="
                  w-4 h-4
                  text-amber-600
                  border-neutral-300 dark:border-neutral-700
                  rounded
                  focus:ring-2 focus:ring-amber-400
                "
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                INFONAVIT
              </span>
            </label>

            <div>
              <label htmlFor="fin_other" className="block text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                Otro (especificar)
              </label>
              <input 
                id="fin_other" 
                type="text"
                placeholder="Especifica otras opciones de financiamiento"
                {...register('financeOptions.other')} 
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-3">
          <button 
            type="submit"
            disabled={loading}
            className="
              flex-1 sm:flex-none
              px-8 py-3
              bg-gradient-to-br from-amber-400 to-yellow-600
              hover:from-amber-500 hover:to-yellow-700
              disabled:from-amber-300 disabled:to-yellow-500
              disabled:opacity-60 disabled:cursor-not-allowed
              text-white
              font-semibold
              rounded-lg
              transition-all
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              flex items-center justify-center gap-2
            "
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? 'Publicando...' : 'Publicar propiedad'}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              reset(propertyFormDefaults);
              setSuccess(null);
            }}
            className="
              flex-1 sm:flex-none
              px-8 py-3
              bg-white dark:bg-neutral-800
              hover:bg-neutral-50 dark:hover:bg-neutral-700
              border border-neutral-300 dark:border-neutral-700
              text-neutral-700 dark:text-neutral-300
              font-medium
              rounded-lg
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
            "
          >
            Limpiar formulario
          </button>
        </div>
      </form>
    </>
  );
}
