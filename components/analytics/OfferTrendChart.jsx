'use client';
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

const LINE_COLORS = ['#C46A4D', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 text-xs">
      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function OfferTrendChart({ trends, loading, error }) {
  if (loading) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Tendencia de Ofertas</h2>
        <p className="text-xs text-red-500 dark:text-red-400 text-center py-12">{error}</p>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Tendencia de Ofertas</h2>
        <p className="text-xs text-neutral-400 text-center py-12">Selecciona una ciudad o colonia para ver la tendencia.</p>
      </div>
    );
  }

  const { chartData, dataKeys, allZero } = useMemo(() => {
    const maxMonths = Math.max(...trends.map((t) => t.values?.length || 0));
    const rawKeys = trends.map((t, i) => t.label || t.colonia || t.ciudad || `Serie ${i + 1}`);
    const seen = {};
    const keys = rawKeys.map((k, i) => {
      if (!seen[k]) { seen[k] = 1; return k; }
      seen[k]++;
      return `${k} (${seen[k]})`;
    });

    const data = [];
    for (let i = 0; i < maxMonths; i++) {
      const point = {};
      trends.forEach((t, ti) => {
        if (t.dates?.[i]) point.month = t.dates[i];
        point[keys[ti]] = t.values?.[i];
      });
      if (Object.keys(point).length > 1) data.push(point);
    }

    const allZero = keys.every((k) => data.every((d) => !d[k]));

    return { chartData: data, dataKeys: keys, allZero };
  }, [trends]);

  if (chartData.length === 0 || allZero) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Tendencia de Ofertas</h2>
        <p className="text-xs text-neutral-400 text-center py-12">Sin datos de tendencia aún.</p>
      </div>
    );
  }

  const maxMonths = chartData.length;

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Tendencia de Ofertas</h2>
      <p className="text-xs text-neutral-400 mb-3">Oferta mediana por m² — últimos {maxMonths} meses</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={dataKeys.length === 1}
                dot={dataKeys.length > 1 ? { r: 2 } : { r: 3 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
