'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PROPERTY_AMENITY_CATEGORIES, getAmenityMeta } from '../lib/constants/propertyServices';

export default function PropertyAmenitiesSelector({ selectedAmenities = [], onChange }) {
  const [expandedCategories, setExpandedCategories] = useState(() => new Set([PROPERTY_AMENITY_CATEGORIES[0]?.id]));

  const selectedAmenityMeta = useMemo(
    () => selectedAmenities.map((amenity) => getAmenityMeta(amenity)),
    [selectedAmenities]
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleAmenity = (amenityValue) => {
    if (selectedAmenities.includes(amenityValue)) {
      onChange(selectedAmenities.filter((amenity) => amenity !== amenityValue));
      return;
    }

    onChange([...selectedAmenities, amenityValue]);
  };

  return (
    <div className="space-y-4">
      {PROPERTY_AMENITY_CATEGORIES.map((category) => {
        const selectedCount = category.items.filter((item) => selectedAmenities.includes(item.value)).length;
        const isExpanded = expandedCategories.has(category.id);

        return (
          <div key={category.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{category.emoji}</span>
                <span>
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">{category.label}</span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">{selectedCount} de {category.items.length} seleccionadas</span>
                </span>
              </span>
              {isExpanded ? <ChevronUp className="h-5 w-5 text-neutral-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-neutral-500" aria-hidden="true" />}
            </button>

            {isExpanded && (
              <div className="grid grid-cols-1 gap-3 border-t border-neutral-200 px-4 py-4 sm:grid-cols-2 dark:border-neutral-800">
                {category.items.map((item) => {
                  const isSelected = selectedAmenities.includes(item.value);
                  return (
                    <label
                      key={item.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-neutral-200 hover:border-amber-300 dark:border-neutral-700'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAmenity(item.value)}
                        className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-400"
                        aria-label={item.label}
                      />
                      <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {selectedAmenityMeta.length > 0 ? `${selectedAmenityMeta.length} amenidades seleccionadas` : 'No hay amenidades seleccionadas todavía.'}
        </div>
        {selectedAmenityMeta.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedAmenityMeta.map((amenity) => (
              <span
                key={amenity.value}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-950 dark:text-neutral-200 dark:ring-neutral-700"
              >
                <span aria-hidden="true">{amenity.emoji}</span>
                <span>{amenity.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}