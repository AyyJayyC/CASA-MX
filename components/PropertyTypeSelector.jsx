'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PROPERTY_TYPE_OPTIONS } from '../lib/constants/propertyOptions';

const PROPERTY_TYPE_META = {
  Casa: { emoji: '🏠', description: 'Ideal para familias y vida residencial.' },
  Departamento: { emoji: '🏢', description: 'Práctico para ciudad y renta urbana.' },
  Terreno: { emoji: '🌄', description: 'Espacio para desarrollar o invertir.' },
  'Local comercial': { emoji: '🛍️', description: 'Pensado para negocio o showroom.' },
  Oficina: { emoji: '💼', description: 'Lista para operación profesional.' },
  Bodega: { emoji: '📦', description: 'Almacenaje, logística o trabajo pesado.' },
};

export default function PropertyTypeSelector({ value = '', onChange, name = 'propertyType' }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {PROPERTY_TYPE_OPTIONS.map((option) => {
        const meta = PROPERTY_TYPE_META[option] || { emoji: '🏘️', description: 'Tipo de propiedad.' };
        const isSelected = value === option;

        return (
          <label
            key={option}
            className={`relative flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition ${isSelected ? 'border-amber-500 bg-amber-50 shadow-sm dark:bg-amber-900/20' : 'border-neutral-300 bg-white hover:border-amber-300 dark:border-neutral-700 dark:bg-neutral-950'}`}
          >
            <input
              id={`propertyType-${option}`}
              type="radio"
              name={name}
              value={option}
              checked={isSelected}
              onChange={() => onChange(option)}
              className="sr-only"
              aria-label={option}
            />
            <span className="text-2xl" aria-hidden="true">{meta.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">{option}</span>
              <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">{meta.description}</span>
            </span>
            {isSelected && <CheckCircle2 className="h-5 w-5 text-amber-600" aria-hidden="true" />}
          </label>
        );
      })}
    </div>
  );
}