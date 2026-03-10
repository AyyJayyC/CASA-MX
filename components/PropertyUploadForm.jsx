/**
 * PropertyUploadForm (client)
 * Purpose: Form for sellers/wholesalers to upload a property.
 * Design: Clean, minimalist form with gold accents and clear validation
 * Uses React Hook Form + Zod for validation. Submissions go to backend via `addProperty`.
 */
'use client';
import React, { useState } from 'react';
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

          {/* Address Autocomplete */}
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
            }}
            onValidationChange={() => {}}
            showHistory={true}
          />

          {/* Address */}
          <div>
            <label htmlFor="address" className={labelClass}>
              Dirección completa *
            </label>
            <input 
              id="address" 
              type="text"
              {...register('address')} 
              className={inputClass}
              placeholder="Calle, número, delegación/municipio, estado"
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
