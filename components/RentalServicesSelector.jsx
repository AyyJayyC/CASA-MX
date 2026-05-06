'use client';

import React from 'react';
import { RENTAL_SERVICE_METADATA } from '../lib/constants/propertyServices';

export default function RentalServicesSelector({ selectedServices = [], onChange }) {
  const toggleService = (serviceValue) => {
    if (selectedServices.includes(serviceValue)) {
      onChange(selectedServices.filter((service) => service !== serviceValue));
      return;
    }

    onChange([...selectedServices, serviceValue]);
  };

  const selectedLabels = RENTAL_SERVICE_METADATA
    .filter((service) => selectedServices.includes(service.value))
    .map((service) => service.label);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RENTAL_SERVICE_METADATA.map((service) => {
          const isSelected = selectedServices.includes(service.value);
          return (
            <label
              key={service.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-700 dark:bg-neutral-950'}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleService(service.value)}
                className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-400"
                aria-label={service.label}
              />
              <span className="text-xl" aria-hidden="true">{service.emoji}</span>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{service.label}</span>
            </label>
          );
        })}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        {selectedLabels.length > 0 ? `Servicios seleccionados: ${selectedLabels.join(', ')}` : 'No hay servicios seleccionados todavía.'}
      </div>
    </div>
  );
}