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
import { addProperty as addPropertyAPI, getLocationsCatalog } from '../lib/api/properties';
import { useAuth } from '../lib/auth/useAuth';
import { useInvalidateProperties } from '../lib/queries/properties';
import { addAddressToCache } from '../lib/services/addressCache';
import { getValidEstados, getCitiesForEstado, getColoniasForCity } from '../lib/utils/addressValidation';
import useNumericInput from '../lib/hooks/useNumericInput';
import Link from 'next/link';
import PropertyImageGallery from './PropertyImageGallery.jsx';
import PropertyTypeSelector from './PropertyTypeSelector.jsx';
import RentalServicesSelector from './RentalServicesSelector.jsx';
import PropertyAmenitiesSelector from './PropertyAmenitiesSelector.jsx';

/**
 * @returns {JSX.Element}
 */
export default function PropertyUploadForm({ listingType = 'for_sale' }) {
  const { session } = useAuth();
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationsCatalog, setLocationsCatalog] = useState(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressSearchRef = useRef(null);
  const addressDebounce = useRef(null);
  const photoInputRef = useRef(null);

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

  useEffect(() => {
    let active = true;

    (async () => {
      const catalog = await getLocationsCatalog();
      if (active && catalog) {
        setLocationsCatalog(catalog);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const invalidateProperties = useInvalidateProperties();

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch
  } = useForm({
    defaultValues: {
      ...propertyFormDefaults,
      listingType,
    },
    resolver: zodResolver(propertySchema)
  });

  useEffect(() => {
    register('propertyType');
    register('includedServices');
    register('amenities');
  }, [register]);

  const getComponent = (components, type) =>
    components?.find(c => c.types?.includes(type))?.long_name || '';

  const getTypedStreetPrefix = (typed, selectedDescription = '') => {
    const v = String(typed || '').trim();
    if (!v) return '';
    // Heuristic: if user typed a number, treat it as street-level intent
    if (!/\d/.test(v)) return '';

    const description = String(selectedDescription || '').trim();
    if (!description) return v;

    let candidate = v;
    const tokens = description
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    for (const token of tokens) {
      const idx = candidate.toLowerCase().indexOf(token.toLowerCase());
      if (idx >= 0) {
        candidate = candidate.slice(0, idx).trim().replace(/[,\-]\s*$/, '');
      }
    }

    return /\d/.test(candidate) ? candidate : v;
  };

  const normalizeAddressText = (text) =>
    String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const getMapsErrorMessage = (payload, fallbackMessage) => {
    if (payload && typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message.trim();
    }

    if (payload && typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error.trim();
    }

    return fallbackMessage;
  };

  const buildGeocodeQueryFromSuggestion = (typedInput, suggestion) => {
    const typed = String(typedInput || '').trim();
    const description = String(suggestion?.description || '').trim();
    if (!description) return typed;

    const hasTypedNumber = /\d/.test(typed);
    if (!hasTypedNumber) return description;

    const structuredMain = String(suggestion?.structured_formatting?.main_text || '').trim();
    const structuredSecondary = String(suggestion?.structured_formatting?.secondary_text || '').trim();
    const typedNorm = normalizeAddressText(typed);
    const mainNorm = normalizeAddressText(structuredMain);

    if (structuredMain && structuredSecondary && typedNorm.startsWith(mainNorm)) {
      return `${typed}, ${structuredSecondary}`;
    }

    const descriptionParts = description.split(',').map((part) => part.trim()).filter(Boolean);
    if (descriptionParts.length > 0) {
      const firstPartNorm = normalizeAddressText(descriptionParts[0]);
      if (typedNorm.startsWith(firstPartNorm)) {
        return [typed, ...descriptionParts.slice(1)].join(', ');
      }
    }

    return description;
  };

  const selectedEstado = watch('estado');
  const selectedCiudad = watch('ciudad');
  const selectedPropertyType = watch('propertyType');
  const selectedIncludedServices = watch('includedServices') || [];
  const selectedAmenities = watch('amenities') || [];
  const photoFiles = watch('photos') || [];

  const updateNumericField = useCallback(
    (fieldName) => (nextValue) => {
      setValue(fieldName, nextValue, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const priceRegister = register('price', { valueAsNumber: true });
  const monthlyRentRegister = register('monthlyRent', { valueAsNumber: true });
  const squareMetersRegister = register('squareMeters', { valueAsNumber: true });
  const bedroomsRegister = register('bedrooms', { valueAsNumber: true });
  const bathroomsRegister = register('bathrooms', { valueAsNumber: true });
  const securityDepositRegister = register('securityDeposit', { valueAsNumber: true });
  const leaseTermMonthsRegister = register('leaseTermMonths', { valueAsNumber: true });

  const priceInput = useNumericInput({ value: watch('price'), onValueChange: updateNumericField('price') });
  const monthlyRentInput = useNumericInput({ value: watch('monthlyRent'), onValueChange: updateNumericField('monthlyRent') });
  const squareMetersInput = useNumericInput({ value: watch('squareMeters'), onValueChange: updateNumericField('squareMeters') });
  const bedroomsInput = useNumericInput({ value: watch('bedrooms'), onValueChange: updateNumericField('bedrooms'), max: 20 });
  const bathroomsInput = useNumericInput({ value: watch('bathrooms'), onValueChange: updateNumericField('bathrooms'), max: 20 });
  const securityDepositInput = useNumericInput({ value: watch('securityDeposit'), onValueChange: updateNumericField('securityDeposit') });
  const leaseTermMonthsInput = useNumericInput({ value: watch('leaseTermMonths'), onValueChange: updateNumericField('leaseTermMonths'), max: 120 });

  const getNumericInputProps = (registration, numericInput) => ({
    ...registration,
    type: 'text',
    inputMode: 'numeric',
    pattern: '[0-9]*',
    value: numericInput.value,
    onChange: numericInput.handlers.onChange,
    onFocus: numericInput.handlers.onFocus,
    onBlur: (event) => {
      numericInput.handlers.onBlur(event);
      registration.onBlur(event);
    },
  });

  const handlePhotoFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const encodedFiles = await Promise.all(
      imageFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    const currentPhotos = getValues('photos') || [];
    const merged = [...currentPhotos, ...encodedFiles].slice(0, 10);
    setValue('photos', merged, { shouldDirty: true, shouldValidate: true });

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removePhotoAt = (index) => {
    const currentPhotos = getValues('photos') || [];
    const nextPhotos = currentPhotos.filter((_, idx) => idx !== index);
    setValue('photos', nextPhotos, { shouldDirty: true, shouldValidate: true });
  };

  const estadosCatalogo = (locationsCatalog?.estados || []).map((e) => e?.nombre).filter(Boolean);
  const estadosDisponibles = [...new Set([...getValidEstados(), ...estadosCatalogo, selectedEstado].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const estadoCatalogo = (locationsCatalog?.estados || []).find(
    (e) => String(e?.nombre || '').toLowerCase() === String(selectedEstado || '').toLowerCase()
  );
  const ciudadesCatalogo = (estadoCatalogo?.ciudades || []).map((c) => c?.nombre).filter(Boolean);
  const ciudadesFallback = selectedEstado ? getCitiesForEstado(selectedEstado) : [];
  const ciudadesDisponibles = [...new Set([...ciudadesFallback, ...ciudadesCatalogo, selectedCiudad].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

  const ciudadCatalogo = (estadoCatalogo?.ciudades || []).find(
    (c) => String(c?.nombre || '').toLowerCase() === String(selectedCiudad || '').toLowerCase()
  );
  const coloniasCatalogo = (ciudadCatalogo?.colonias || []).filter(Boolean);
  const coloniasFallback = selectedEstado && selectedCiudad ? getColoniasForCity(selectedEstado, selectedCiudad) : [];
  const selectedColonia = watch('colonia');
  const coloniasDisponibles = [...new Set([...coloniasFallback, ...coloniasCatalogo, selectedColonia].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-MX')
  );

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

  const fillFromGeocode = useCallback(async (description, typedInput = '', selectedSuggestion = null) => {
    try {
      const res = await fetch(`${BACKEND_URL}/maps/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        // Google Maps result
        const comps = result.address_components;
        const streetNum = getComponent(comps, 'street_number');
        const route = getComponent(comps, 'route');
        const suggestionComponents = selectedSuggestion?.address_components || {};
        const cpFromFormatted = String(result.formatted_address || '').match(/\b\d{5}\b/)?.[0] || '';
        const colonia =
          getComponent(comps, 'neighborhood') ||
          getComponent(comps, 'sublocality_level_1') ||
          getComponent(comps, 'sublocality_level_2') ||
          getComponent(comps, 'sublocality') ||
          suggestionComponents.colonia || '';
        const ciudad =
          getComponent(comps, 'locality') ||
          getComponent(comps, 'administrative_area_level_3') ||
          getComponent(comps, 'administrative_area_level_2') ||
          getComponent(comps, 'postal_town') ||
          suggestionComponents.ciudad || '';
        const estado =
          getComponent(comps, 'administrative_area_level_1') ||
          getComponent(comps, 'administrative_area_level_2') ||
          suggestionComponents.estado || '';
        const cp = getComponent(comps, 'postal_code') || suggestionComponents.codigoPostal || cpFromFormatted || '';
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

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

        setValue('address', composedAddress);
        const lat = result.lat ? Number(result.lat) : null;
        const lon = result.lon ? Number(result.lon) : null;

        if (estado || suggestionComponents.estado) setValue('estado', estado || suggestionComponents.estado);
        if (ciudad || suggestionComponents.ciudad) setValue('ciudad', ciudad || suggestionComponents.ciudad);
        if (colonia || suggestionComponents.colonia) setValue('colonia', colonia || suggestionComponents.colonia);
        if (cp) setValue('codigoPostal', cp);
        if (lat) setValue('latitude', lat);
        if (lon) setValue('longitude', lon);
        setAddressSearch(composedAddress);
      }
    } catch (e) {
      console.error('Geocode fill error:', e);
      setAddressSearchError(e instanceof Error ? e.message : 'No se pudo buscar la direccion.');
    }
  }, [BACKEND_URL, setValue]);

  async function onSubmit(values) {
    try {
      setLoading(true);
      
      const payload = {
        ...values,
        listingType,
        imageUrls: values.photos || [],
        ...(listingType === 'for_sale'
          ? {
              price: values.price,
            }
          : {
              monthlyRent: values.monthlyRent,
              ...(values.securityDeposit ? { securityDeposit: values.securityDeposit } : {}),
              ...(values.leaseTermMonths ? { leaseTermMonths: values.leaseTermMonths } : {}),
              ...(values.availableFrom ? { availableFrom: values.availableFrom } : {}),
              furnished: Boolean(values.furnished),
              utilitiesIncluded: (values.includedServices || []).length > 0,
              includedServices: values.includedServices || [],
              amenities: values.amenities || [],
            }),
        ...(Number.isFinite(values.latitude) ? { lat: values.latitude } : {}),
        ...(Number.isFinite(values.longitude) ? { lng: values.longitude } : {}),
      };

      // Call real backend API
          const created = await addPropertyAPI(payload);

      // Save address to cache for future suggestions
      const addressData = {
        estado: values.estado,
        ciudad: values.ciudad,
        colonia: values.colonia,
        codigoPostal: values.codigoPostal,
      };
      addAddressToCache(addressData);

      setSuccess(created);
      reset({ ...propertyFormDefaults, listingType, photos: [] });
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }

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

  const normalizeSuggestionText = (text) =>
    String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

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

          {/* Price/Rent and Square Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              {listingType === 'for_sale' ? (
                <>
                  <label htmlFor="price" className={labelClass}>
                    Precio (MXN) *
                  </label>
                  <input 
                    id="price" 
                    {...getNumericInputProps(priceRegister, priceInput)}
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
                </>
              ) : (
                <>
                  <label htmlFor="monthlyRent" className={labelClass}>
                    Renta mensual (MXN) *
                  </label>
                  <input 
                    id="monthlyRent" 
                    {...getNumericInputProps(monthlyRentRegister, monthlyRentInput)}
                    className={inputClass}
                    placeholder="0"
                  />
                  {errors.monthlyRent && (
                    <p className={errorClass}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.monthlyRent.message}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <label htmlFor="squareMeters" className={labelClass}>
                Metros cuadrados *
              </label>
              <input 
                id="squareMeters" 
                {...getNumericInputProps(squareMetersRegister, squareMetersInput)}
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
                  setAddressSearchError('');
                  setValue('address', v);
                  setShowAddressSuggestions(true);
                  clearTimeout(addressDebounce.current);
                  if (v.length >= 4) {
                    setAddressSearchLoading(true);
                    addressDebounce.current = setTimeout(async () => {
                      try {
                        const r = await fetch(`${BACKEND_URL}/maps/autocomplete?input=${encodeURIComponent(v)}`);
                        const payload = await r.json().catch(() => null);
                        if (!r.ok) {
                          throw new Error(getMapsErrorMessage(payload, 'No se pudo autocompletar la direccion.'));
                        }
                        const { predictions } = payload || {};
                        setAddressSuggestions(predictions || []);
                        setAddressSearchError('');
                      } catch (error) {
                        setAddressSuggestions([]);
                        setAddressSearchError(error instanceof Error ? error.message : 'No se pudo autocompletar la direccion.');
                      } finally {
                        setAddressSearchLoading(false);
                      }
                    }, 400);
                  } else {
                    setAddressSuggestions([]);
                    setAddressSearchError('');
                    setAddressSearchLoading(false);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();

                    if (showAddressSuggestions && addressSuggestions.length > 0) {
                      const first = addressSuggestions[0];
                      if (first?.description) {
                        const typed = addressSearch.trim();
                        const query = buildGeocodeQueryFromSuggestion(typed, first);
                        setShowAddressSuggestions(false);
                        setAddressSuggestions([]);
                        await fillFromGeocode(query, typed, first);
                        return;
                      }
                    }

                    if ((addressSearch || '').trim().length >= 4) {
                      setShowAddressSuggestions(false);
                      setAddressSuggestions([]);
                      await fillFromGeocode(addressSearch.trim(), addressSearch.trim());
                    }
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
            {addressSearchError && (
              <p className={errorClass}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {addressSearchError}
              </p>
            )}
            {showAddressSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {addressSuggestions.map((s, i) => (
                  <button
                    key={s.place_id || i}
                    type="button"
                    onClick={async () => {
                      const typed = addressSearch.trim();
                      const query = buildGeocodeQueryFromSuggestion(typed, s);
                      setShowAddressSuggestions(false);
                      setAddressSuggestions([]);
                      await fillFromGeocode(query, typed, s);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-neutral-100 dark:border-neutral-700 last:border-0 transition-colors"
                  >
                    {(() => {
                      const display = getSuggestionDisplay(s);
                      return (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-neutral-800 dark:text-neutral-100 leading-5 truncate">
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
          </div>

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

          {/* Auto-filled location parts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estado" className={labelClass}>
                Estado
              </label>
              <select
                id="estado"
                {...register('estado', {
                  onChange: () => {
                    setValue('ciudad', '', { shouldDirty: true, shouldValidate: true });
                    setValue('colonia', '', { shouldDirty: true, shouldValidate: true });
                    queueMicrotask(syncFullAddressFromLocation);
                  },
                  onBlur: syncFullAddressFromLocation,
                })}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Seleccionar estado...</option>
                {estadosDisponibles.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ciudad" className={labelClass}>
                Ciudad
              </label>
              <select
                id="ciudad"
                disabled={!selectedEstado}
                {...register('ciudad', {
                  onChange: () => {
                    setValue('colonia', '', { shouldDirty: true, shouldValidate: true });
                    queueMicrotask(syncFullAddressFromLocation);
                  },
                  onBlur: syncFullAddressFromLocation,
                })}
                className={`${inputClass} appearance-none disabled:opacity-60`}
              >
                <option value="">Seleccionar ciudad...</option>
                {ciudadesDisponibles.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="colonia" className={labelClass}>
                Colonia
              </label>
              <select
                id="colonia"
                disabled={!selectedEstado || !selectedCiudad}
                {...register('colonia', { onBlur: syncFullAddressFromLocation })}
                className={`${inputClass} appearance-none disabled:opacity-60`}
              >
                <option value="">Seleccionar colonia...</option>
                {coloniasDisponibles.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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

        {/* Property Details Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Detalles de la propiedad
          </h2>

          {/* Property Type */}
          <div>
            <label className={labelClass}>
              Tipo de propiedad *
            </label>
            <PropertyTypeSelector
              value={selectedPropertyType}
              onChange={(nextValue) => setValue('propertyType', nextValue, { shouldDirty: true, shouldValidate: true })}
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
                {...getNumericInputProps(bedroomsRegister, bedroomsInput)}
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
                {...getNumericInputProps(bathroomsRegister, bathroomsInput)}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>

          {/* Rental Details */}
          {listingType === 'for_rent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="securityDeposit" className={labelClass}>
                  Depósito de seguridad (MXN)
                </label>
                <input
                  id="securityDeposit"
                  {...getNumericInputProps(securityDepositRegister, securityDepositInput)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="leaseTermMonths" className={labelClass}>
                  Plazo de contrato (meses)
                </label>
                <input
                  id="leaseTermMonths"
                  {...getNumericInputProps(leaseTermMonthsRegister, leaseTermMonthsInput)}
                  className={inputClass}
                  placeholder="12"
                />
              </div>

              <div>
                <label htmlFor="availableFrom" className={labelClass}>
                  Disponible desde
                </label>
                <input
                  id="availableFrom"
                  type="date"
                  {...register('availableFrom')}
                  className={inputClass}
                />
              </div>

              <div className="flex items-end gap-6 pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="furnished"
                    type="checkbox"
                    {...register('furnished')}
                    className="w-4 h-4 text-amber-600 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Amueblada</span>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Servicios incluidos</h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Marca exactamente qué paga el propietario en esta renta.
                  </p>
                </div>
                <RentalServicesSelector
                  selectedServices={selectedIncludedServices}
                  onChange={(nextValue) => setValue('includedServices', nextValue, { shouldDirty: true, shouldValidate: true })}
                />
              </div>

              <div className="sm:col-span-2 space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Amenidades y equipamiento</h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Incluye equipo y comodidades comunes en rentas amuebladas o largas estancias.
                  </p>
                </div>
                <PropertyAmenitiesSelector
                  selectedAmenities={selectedAmenities}
                  onChange={(nextValue) => setValue('amenities', nextValue, { shouldDirty: true, shouldValidate: true })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            Fotos de la propiedad
          </h2>

          <div>
            <label htmlFor="photos-upload" className={labelClass}>
              Subir imágenes <span className="text-neutral-400 text-xs font-normal">(máximo 10)</span>
            </label>
            <input
              id="photos-upload"
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoFiles}
              className="block w-full text-sm text-neutral-700 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              La primera imagen será la portada en listados.
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {photoFiles.length} de 10 fotos cargadas
            </p>
          </div>

          {photoFiles.length > 0 && (
            <div className="space-y-4">
              <PropertyImageGallery images={photoFiles} title="Vista previa" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photoFiles.map((photo, index) => (
                  <div key={`${index}-${String(photo).slice(0, 24)}`} className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhotoAt(index)}
                      className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/70 text-xs text-white hover:bg-black"
                      aria-label={`Eliminar foto ${index + 1}`}
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white">
                        Portada
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Financing Options Section */}
        {listingType === 'for_sale' && (
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
        )}

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
              reset({ ...propertyFormDefaults, listingType, photos: [] });
              setSuccess(null);
              if (photoInputRef.current) {
                photoInputRef.current.value = '';
              }
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
