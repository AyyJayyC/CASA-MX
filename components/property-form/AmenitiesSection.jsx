'use client';
import React from 'react';
import RentalServicesSelector from '../RentalServicesSelector.jsx';
import PropertyAmenitiesSelector from '../PropertyAmenitiesSelector.jsx';

export default function AmenitiesSection({
  register, errors, setValue, watch,
  inputClass, labelClass, errorClass,
  listingType,
}) {
  if (listingType !== 'for_rent') return null;

  const selectedIncludedServices = watch('includedServices') || [];
  const selectedAmenities = watch('amenities') || [];

  return (
    <>
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
    </>
  );
}
