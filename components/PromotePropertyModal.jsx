'use client';
import React, { useState } from 'react';
import { promoteProperty } from '@/lib/api/properties';
import { useAuth } from '@/lib/auth/useAuth';
import { useInvalidateProperties } from '@/lib/queries/properties';

const TIERS = [
  {
    key: 'featured',
    name: '⭐ Destacado',
    desc: 'Aparece al inicio de los resultados con una insignia dorada.',
    costPerDay: 300,
  },
  {
    key: 'carousel',
    name: '🔥 Promocionado',
    desc: 'Todo lo de Destacado + aparece en el carrusel de la página principal.',
    costPerDay: 800,
  },
];

export default function PromotePropertyModal({ propertyId, propertyTitle, onClose }) {
  const { user } = useAuth();
  const invalidate = useInvalidateProperties();
  const [tier, setTier] = useState('featured');
  const [days, setDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!user) return null;

  const selected = TIERS.find((t) => t.key === tier);
  const totalCost = (selected?.costPerDay || 0) * days;

  const handlePromote = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await promoteProperty(propertyId, tier, days);
      setSuccess(result);
      invalidate();
    } catch (err) {
      setError(err.message || 'Error al promocionar la propiedad');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Promocionar propiedad</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
            <p className="text-green-800 dark:text-green-300 font-medium">¡Propiedad promocionada!</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              "{propertyTitle}" ahora es {selected?.name} por {days} días.
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">Costo total: {totalCost.toLocaleString()} créditos</p>
            <button onClick={onClose} className="mt-2 w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Property name */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Propiedad: <span className="font-medium text-neutral-700 dark:text-neutral-300">{propertyTitle}</span>
            </p>

            {/* Tier selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tipo de promoción</label>
              <div className="grid grid-cols-1 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTier(t.key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tier === t.key
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-amber-300'
                    }`}
                  >
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{t.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t.desc}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">{t.costPerDay.toLocaleString()} créditos/día</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Days slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Duración</label>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{days} días</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>1</span>
                <span>30</span>
              </div>
            </div>

            {/* Cost summary */}
            <div className="flex justify-between items-center p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Costo total</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalCost.toLocaleString()} créditos</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePromote}
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              {submitting ? 'Promocionando...' : 'Promocionar propiedad'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
