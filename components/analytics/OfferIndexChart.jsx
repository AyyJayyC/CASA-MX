'use client';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

const PIE_COLORS = ['#C46A4D', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#eab308'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 text-xs">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function OfferIndexChart({ data, loading }) {
  const chartData = useMemo(() =>
    data && data.length > 0
      ? [...data].sort((a, b) => b.medianOfferPerSqm - a.medianOfferPerSqm).slice(0, 12)
      : [],
    [data]
  );

  if (loading) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
        <div className="h-4 w-44 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Índice de Oferta por m²</h2>
        <p className="text-xs text-neutral-400 text-center py-12">Sin datos suficientes.</p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Oferta mediana por m²</h2>
      <p className="text-xs text-neutral-400 mb-3">Por ciudad, ordenado mayor a menor</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9CA3AF" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="ciudad" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={75} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="medianOfferPerSqm" name="Oferta/m²" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
