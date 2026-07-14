'use client';
import React from 'react';
import PropertyTypeSelector from '../PropertyTypeSelector.jsx';
import { CONDITION_LABELS, FURNISHED_LABELS, PARKING_TYPE_LABELS, STATUS_LABELS, VISIBILITY_LABELS } from '../../lib/constants/propertyOptions';

export default function DetailsSection({
  register, errors, watch, setValue,
  inputClass, labelClass, errorClass,
  getNumericInputProps, bedroomsRegister, bedroomsInput, bathroomsRegister, bathroomsInput,
}) {
  return (
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
          value={watch('propertyType')}
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

      {/* Bedrooms, Bathrooms, Parking, Mini Splits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="bedrooms" className={labelClass}>
            Recámaras
          </label>
          <input
            id="bedrooms"
            {...getNumericInputProps(bedroomsRegister, bedroomsInput)}
            className={inputClass}
            placeholder="0"
            min="0"
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
            min="0"
          />
        </div>
        <div>
          <label htmlFor="parkingSpaces" className={labelClass}>
            Cajones de estacionamiento
          </label>
          <input
            id="parkingSpaces"
            type="number"
            min="0"
            {...register('parkingSpaces', {
              setValueAs: (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
            })}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="miniSplits" className={labelClass}>
            Mini splits
          </label>
          <input
            id="miniSplits"
            type="number"
            min="0"
            {...register('miniSplits', {
              setValueAs: (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
            })}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      {/* Property Condition */}
      <div>
        <label className={labelClass}>Condición de la propiedad</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <label key={value} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
              watch('condition') === value
                ? 'border-clay-400 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-clay-300'
            }`}>
              <input type="radio" value={value} className="sr-only"
                {...register('condition')}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Additional Details Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="yearBuilt" className={labelClass}>Año de construcción</label>
          <input id="yearBuilt" type="number" min="1900" max="2027"
            {...register('yearBuilt', { setValueAs: v => v === '' ? undefined : Number(v) })}
            className={inputClass} placeholder="2020"
          />
        </div>
        <div>
          <label htmlFor="floors" className={labelClass}>Número de pisos</label>
          <input id="floors" type="number" min="1" max="100"
            {...register('floors', { setValueAs: v => v === '' ? undefined : Number(v) })}
            className={inputClass} placeholder="1"
          />
        </div>
        <div>
          <label htmlFor="halfBaths" className={labelClass}>Medios baños</label>
          <input id="halfBaths" type="number" min="0" max="20"
            {...register('halfBaths', { setValueAs: v => v === '' ? undefined : Number(v) })}
            className={inputClass} placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="maintenanceFee" className={labelClass}>Cuota de mantenimiento (MXN/mes)</label>
          <input id="maintenanceFee" type="number" min="0"
            {...register('maintenanceFee', { setValueAs: v => v === '' ? undefined : Number(v) })}
            className={inputClass} placeholder="0"
          />
        </div>
      </div>

      {/* Parking Type */}
      <div>
        <label className={labelClass}>Tipo de estacionamiento</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(PARKING_TYPE_LABELS).map(([value, label]) => (
            <label key={value} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
              watch('parkingType') === value
                ? 'border-clay-400 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-clay-300'
            }`}>
              <input type="radio" value={value} className="sr-only"
                {...register('parkingType')}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div>
        <label className={labelClass}>Amueblado</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(FURNISHED_LABELS).map(([value, label]) => (
            <label key={value} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
              watch('furnished') === value
                ? 'border-clay-400 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-clay-300'
            }`}>
              <input type="radio" value={value} className="sr-only"
                {...register('furnished')}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Property Status */}
      <div>
        <label className={labelClass}>Estatus de la propiedad</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <label key={value} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
              (watch('status') || 'disponible') === value
                ? 'border-clay-400 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-clay-300'
            }`}>
              <input type="radio" value={value} className="sr-only"
                {...register('status')}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {watch('status') === 'preventa' || watch('status') === 'en_remodelacion'
            ? 'La propiedad se mostrará como próximamente disponible.'
            : watch('status') === 'bajo_promesa'
            ? 'La propiedad ya tiene un acuerdo pero aún no se ha cerrado.'
            : watch('status') === 'vendido' || watch('status') === 'rentado' || watch('status') === 'retirado'
            ? 'La propiedad será removida de las búsquedas.'
            : 'La propiedad está disponible y lista para mostrarse.'}
        </p>
      </div>

      {/* Available From (when pre-release) */}
      {(watch('status') === 'preventa' || watch('status') === 'en_remodelacion') && (
        <div className="p-4 border border-clay-200 dark:border-clay-800 rounded-lg bg-clay-50 dark:bg-clay-900/10">
          <label htmlFor="availableFrom" className={labelClass}>
            Fecha de disponibilidad
          </label>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 block -mt-1 mb-1">
            ¿Cuándo estará lista la propiedad?
          </span>
          <input
            id="availableFrom"
            type="date"
            {...register('availableFrom')}
            className={inputClass}
          />
        </div>
      )}

      {/* Visibility */}
      <div>
        <label className={labelClass}>Visibilidad de la propiedad</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
            <label key={value} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
              (watch('visibility') || 'public') === value
                ? 'border-clay-400 bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-400'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-clay-300'
            }`}>
              <input type="radio" value={value} className="sr-only"
                {...register('visibility')}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {watch('visibility') === 'private'
            ? '🔒 Solo visible para agentes y administradores. No aparecerá en búsquedas públicas.'
            : '🌐 Visible para todos los usuarios en búsquedas públicas.'}
        </p>
      </div>

      {/* Policies */}
      <div className="space-y-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Políticas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('petFriendly')}
              className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Acepta mascotas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('childrenWelcome')}
              className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Apto para niños</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('issuesInvoice')}
              className="w-4 h-4 rounded border-neutral-300 text-clay-500 focus:ring-clay-400"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Emite factura</span>
          </label>
        </div>
        {watch('petFriendly') && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              <label htmlFor="petFee" className={labelClass}>Cuota por mascota (MXN/mes)</label>
              <input id="petFee" type="number" min="0"
                {...register('petFee', { setValueAs: v => v === '' ? undefined : Number(v) })}
                className={inputClass} placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="petDeposit" className={labelClass}>Depósito por mascota (MXN)</label>
              <input id="petDeposit" type="number" min="0"
                {...register('petDeposit', { setValueAs: v => v === '' ? undefined : Number(v) })}
                className={inputClass} placeholder="0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
