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
import { addProperty as addPropertyAPI, updateProperty as updatePropertyAPI, publishProperty as publishPropertyAPI } from '../lib/api/properties';
import { getUnifiedCatalog } from '../lib/api/locations.js';
import { useAuth } from '../lib/auth/useAuth';
import { useInvalidateProperties } from '../lib/queries/properties';
import { useUserStore } from "../lib/stores/userStore";
import { logger } from "../lib/logging/logger";
import useNumericInput from '../lib/hooks/useNumericInput';
import Link from 'next/link';
import AddressSection from './property-form/AddressSection.jsx';
import DetailsSection from './property-form/DetailsSection.jsx';
import MediaSection from './property-form/MediaSection.jsx';
import AmenitiesSection from './property-form/AmenitiesSection.jsx';
import PricingSection from './property-form/PricingSection.jsx';
import DocumentsSection from './property-form/DocumentsSection.jsx';

/**
 * @returns {JSX.Element}
 */
export default function PropertyUploadForm({ listingType = 'for_sale', initialValues = null, propertyId = null, onSave }) {
  const isEditing = Boolean(initialValues && propertyId);
  const { session } = useAuth();
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitValidationError, setSubmitValidationError] = useState('');
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [locationsCatalog, setLocationsCatalog] = useState(null);
  const photoInputRef = useRef(null);

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
    defaultValues: isEditing && initialValues ? {
      ...propertyFormDefaults,
      ...initialValues,
      listingType: initialValues.listingType || listingType,
      photos: initialValues.imageUrls || initialValues.photos || [],
    } : {
      ...propertyFormDefaults,
      listingType,
    },
    resolver: zodResolver(propertySchema)
  });

  useEffect(() => {
    register('listingType');
    register('propertyType');
    register('includedServices');
    register('amenities');
  }, [register]);

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

  function buildPayload(values, mode = 'save') {
    const payload = {
      ...values,
      listingType,
      imageUrls: values.photos || [],
      issuesInvoice: values.issuesInvoice ?? false,
      petFriendly: values.petFriendly ?? false,
      petFee: values.petFriendly ? (values.petFee ?? null) : null,
      petDeposit: values.petFriendly ? (values.petDeposit ?? null) : null,
      childrenWelcome: values.childrenWelcome ?? false,
      ...(mode === 'draft' ? { status: 'incompleto', visibility: 'private' } : {}),
      ...(listingType === 'for_sale'
        ? {
            price: values.price,
            financeOptions: [
              values.financeOptions?.cash ? 'cash' : null,
              values.financeOptions?.bankLoan ? 'bankLoan' : null,
              values.financeOptions?.INFONAVIT ? 'INFONAVIT' : null,
              values.financeOptions?.FOVISSSTE ? 'FOVISSSTE' : null,
              values.financeOptions?.paymentPlan ? 'paymentPlan' : null,
              values.financeOptions?.other ? 'other' : null,
            ].filter(Boolean),
          }
        : {
            monthlyRent: values.monthlyRent,
            ...(values.securityDeposit ? { securityDeposit: values.securityDeposit } : {}),
            ...(values.leaseTermMonths ? { leaseTermMonths: values.leaseTermMonths } : {}),
            ...(values.availableFrom ? { availableFrom: values.availableFrom } : {}),
            utilitiesIncluded: (values.includedServices || []).length > 0,
            includedServices: values.includedServices || [],
            amenities: values.amenities || [],
          }),
      ...(Number.isFinite(values.latitude) ? { lat: values.latitude } : {}),
      ...(Number.isFinite(values.longitude) ? { lng: values.longitude } : {}),
    };
    return payload;
  }

  async function onSubmit(values, mode = 'save') {
    try {
      setSubmitValidationError('');
      setLoading(true);

      const payload = buildPayload(values, mode);

      const created = isEditing
        ? await updatePropertyAPI(propertyId, payload)
        : await addPropertyAPI(payload);

      const addressData = {
        estado: (values.estado || "").trim().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        ciudad: (values.ciudad || "").trim().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        colonia: (values.colonia || "").trim().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        codigoPostal: values.codigoPostal,
      };
      try { useUserStore.getState().addAddress(addressData); } catch (err) {
        logger.logError(err, "Failed to save address to user store");
      }

      setSuccess(created);
      reset({ ...propertyFormDefaults, listingType, photos: [] });
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }

      invalidateProperties();

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      logger.logError(error, 'Error publishing property');
      if (error?.code === 'EMAIL_NOT_VERIFIED') {
        alert('Debes verificar tu correo electrónico antes de publicar propiedades. Revisa tu correo y vuelve a intentarlo.');
      } else if (error?.code === 'INE_NOT_VERIFIED') {
        alert('Debes subir y verificar tu INE antes de publicar propiedades. Puedes hacerlo en Ajustes de perfil.');
      } else {
        alert('Error al publicar la propiedad: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  }

  function getFirstErrorEntry(errorMap, path = '') {
    for (const [key, value] of Object.entries(errorMap || {})) {
      if (!value) continue;

      const nextPath = path ? `${path}.${key}` : key;

      if (typeof value.message === 'string' && value.message.trim()) {
        return { path: nextPath, message: value.message.trim() };
      }

      if (typeof value === 'object') {
        const nestedEntry = getFirstErrorEntry(value, nextPath);
        if (nestedEntry) return nestedEntry;
      }
    }

    return null;
  }

  function onInvalid(errorMap) {
    const firstError = getFirstErrorEntry(errorMap);
    const firstMessage = firstError
      ? `${firstError.path}: ${firstError.message}`
      : 'Completa los campos requeridos antes de publicar.';

    setSubmitValidationError(firstMessage);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const inputClass = `
    w-full px-4 py-2.5
    bg-white dark:bg-neutral-950
    border border-neutral-300 dark:border-neutral-700
    rounded-lg
    text-neutral-900 dark:text-neutral-100
    placeholder:text-neutral-500
    focus:outline-none focus:ring-2 focus:ring-clay-400 focus:border-transparent
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

  const sharedSubProps = {
    register, errors, watch, setValue, getValues,
    inputClass, labelClass, errorClass,
  };

  return (
    <>
      {/* Success Message + Document Upload */}
      {success && (
        <div className="mb-6 space-y-6">
          <div className="
            p-4
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
                  {isEditing ? '¡Cambios guardados!' : '¡Propiedad registrada!'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  {isEditing
                    ? `"${success.title || 'Propiedad'}" actualizada correctamente.`
                    : `${success.title} — ahora sube los documentos de verificación de la propiedad para publicarla.`
                  }
                </p>
                {!isEditing && success.publishEligibility && !success.publishEligibility.canPublish && (
                  <p className="text-sm text-clay-800 dark:text-clay-300 bg-clay-50 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 rounded-lg px-3 py-2">
                    Esta propiedad quedó en borrador. Para publicarla necesitas correo verificado e INE verificada en tu cuenta.
                    <Link href="/settings" className="underline ml-1">Ir a Ajustes</Link>
                  </p>
                )}
                {isEditing && (
                  <div className="flex gap-2 mt-3">
                    <Link href={`/properties/${propertyId}`} className="px-4 py-2 bg-clay hover:bg-clay-500 text-white text-sm font-semibold rounded-lg transition-colors">
                      Ver propiedad
                    </Link>
                    {onSave && (
                      <button onClick={() => onSave(success)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
                        Ir a Mis Propiedades
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DocumentsSection
            success={success}
            isEditing={isEditing}
            propertyId={propertyId}
            sellerRole={session?.activeRole ?? 'owner'}
          />
        </div>
      )}

      {!success && (
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 overflow-hidden">
        {submitValidationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitValidationError}
          </div>
        )}

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
                Metros de construcción *
              </label>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block -mt-1 mb-1">Superficie construida / espacio habitable</span>
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
            <div>
              <label htmlFor="lotSize" className={labelClass}>Metros de terreno</label>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block -mt-1 mb-1">Superficie total del lote</span>
              <input id="lotSize" type="number" min="0"
                {...register('lotSize', { setValueAs: v => v === '' ? undefined : Number(v) })}
                className={inputClass} placeholder="Ej: 200"
              />
            </div>
          </div>
        </div>

        <AddressSection
          {...sharedSubProps}
          locationsCatalog={locationsCatalog}
        />

        <DetailsSection
          {...sharedSubProps}
          getNumericInputProps={getNumericInputProps}
          bedroomsRegister={bedroomsRegister}
          bedroomsInput={bedroomsInput}
          bathroomsRegister={bathroomsRegister}
          bathroomsInput={bathroomsInput}
        />

        {/* Rental Details */}
        {listingType === 'for_rent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PricingSection
              {...sharedSubProps}
              listingType={listingType}
              getNumericInputProps={getNumericInputProps}
              securityDepositRegister={securityDepositRegister}
              securityDepositInput={securityDepositInput}
              leaseTermMonthsRegister={leaseTermMonthsRegister}
              leaseTermMonthsInput={leaseTermMonthsInput}
            />

            <AmenitiesSection
              {...sharedSubProps}
              listingType={listingType}
            />
          </div>
        )}

        <MediaSection
          {...sharedSubProps}
          photoInputRef={photoInputRef}
          photoFiles={photoFiles}
          handlePhotoFiles={handlePhotoFiles}
          removePhotoAt={removePhotoAt}
        />

        {/* Financing Options Section */}
        {listingType === 'for_sale' && (
          <PricingSection
            {...sharedSubProps}
            listingType={listingType}
            getNumericInputProps={getNumericInputProps}
            securityDepositRegister={securityDepositRegister}
            securityDepositInput={securityDepositInput}
            leaseTermMonthsRegister={leaseTermMonthsRegister}
            leaseTermMonthsInput={leaseTermMonthsInput}
          />
        )}

        {/* Ownership disclaimer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={ownershipConfirmed}
              onChange={(e) => setOwnershipConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400 shrink-0"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">
              Certifico que soy el propietario o tengo autorización legal para publicar esta propiedad, y que la información proporcionada es verídica. Acepto que deberé subir documentos que acrediten la propiedad y que la publicación permanecerá pendiente de verificación hasta su revisión.
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const data = getValues();
                  if (!data.photos || data.photos.length === 0) {
                    setSubmitValidationError('Agrega al menos una foto para publicar');
                    return;
                  }
                  setLoading(true);
                  try {
                    const payload = buildPayload(data);
                    await updatePropertyAPI(propertyId, payload);
                    await publishPropertyAPI(propertyId);
                    setSuccess('¡Propiedad publicada!');
                    if (onSave) onSave();
                  } catch (err) {
                    setSubmitValidationError(err.message || 'Error al publicar');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 disabled:from-clay-300 disabled:to-clay-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading || !ownershipConfirmed}
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 disabled:from-clay-300 disabled:to-clay-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Guardando...' : 'Publicar propiedad'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              reset({ ...propertyFormDefaults, listingType, photos: [] });
              setSuccess(null);
              if (photoInputRef.current) {
                photoInputRef.current.value = '';
              }
            }}
            className="flex-1 sm:flex-none px-8 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2"
          >
            Limpiar formulario
          </button>
        </div>
      </form>
      )}
    </>
  );
}
