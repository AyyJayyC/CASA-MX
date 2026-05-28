'use client';
import React from 'react';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';

function KpiCard({ title, value, trend, trendLabel, format = 'number', positive = true }) {
  const fmt = format === 'currency' ? formatCurrency :
              format === 'percent' ? formatPercentage :
              formatNumber;

  const safeTrend = (trend != null && !isNaN(trend)) ? trend : null;
  const isGood = safeTrend != null ? (positive ? safeTrend >= 0 : safeTrend <= 0) : null;

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col gap-1">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{fmt(value)}</p>
      {safeTrend != null && (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {safeTrend > 0 ? '▴' : safeTrend < 0 ? '▾' : '—'} {Math.abs(safeTrend).toFixed(1)}%
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">{trendLabel || 'vs. mes pasado'}</span>
        </div>
      )}
    </div>
  );
}

export default function MarketKpiCards({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
            <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard
        title="Activos"
        value={summary.activeListings}
        trend={summary.activeListingsMoM}
      />
      <KpiCard
        title="Oferta/m² mediana"
        value={summary.medianOfferPerSqm}
        format="currency"
        trend={summary.momChange}
      />
      <KpiCard
        title="1ᵃ oferta (días)"
        value={summary.medianDaysToOffer}
        trend={summary.daysMoM}
        positive={false}
      />
      <KpiCard
        title="Ofertas/propiedad"
        value={summary.avgOffersPerProperty}
        format="number"
        trend={summary.offersMoM}
      />
      <KpiCard
        title="Tasa aceptación"
        value={summary.acceptanceRate}
        format="percent"
        trend={summary.acceptanceMoM}
      />
      <KpiCard
        title="Estancadas &gt;60d"
        value={summary.staleCount}
        trend={summary.staleMoM}
        positive={false}
      />
    </div>
  );
}
