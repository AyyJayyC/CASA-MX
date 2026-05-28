'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { formatNumber, formatCurrency, formatPercentage, formatDate } from '@/lib/utils/format';
import OfferTrendChart from './OfferTrendChart';
import { getComps, getOfferTrends } from '@/lib/api/analytics';

const SORT_COLUMNS = {
  ciudad: 'Ciudad',
  activeListings: 'Activos',
  medianOfferPerSqm: 'Oferta/m²',
  momChange: 'MoM%',
  medianDaysToOffer: 'Días',
  avgOffersPerProperty: 'Of/Prop',
  acceptanceRate: 'Acept%',
  staleCount: 'Estanc.',
  activityScore: 'Score',
};

export default function CityMarketTable({ cities, loading, onDrilldown, listingType = 'for_sale' }) {
  const [sortKey, setSortKey] = useState('activeListings');
  const [sortDir, setSortDir] = useState('desc');

  if (loading) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!cities || cities.length === 0) {
    return (
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Mercado por Ciudad</h2>
        <p className="text-xs text-neutral-400 text-center py-12">Sin datos de mercado disponibles.</p>
      </div>
    );
  }

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const sorted = useMemo(() =>
    [...cities].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    }),
    [cities, sortKey, sortDir]
  );

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Mercado por Ciudad</h2>
        <span className="text-xs text-neutral-400">{cities.length} ciudades</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              {Object.entries(SORT_COLUMNS).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`py-2 px-1.5 text-left font-medium cursor-pointer hover:text-clay dark:hover:text-clay-400 transition-colors ${
                    sortKey === key ? 'text-clay dark:text-clay-400' : 'text-neutral-500 dark:text-neutral-400'
                  } ${key === 'ciudad' ? 'sticky left-0 bg-white dark:bg-neutral-900 z-10' : ''}`}
                >
                  {label}
                  {sortKey === key && (
                    <span className="ml-0.5">{sortDir === 'desc' ? ' ▾' : ' ▴'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((city) => (
              <CityRow
                key={city.ciudad}
                city={city}
                onDrilldown={onDrilldown}
                listingType={listingType}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CityRowInner({ city, onDrilldown, listingType = 'for_sale' }) {
  const [expanded, setExpanded] = useState(false);
  const [colonias, setColonias] = useState(null);
  const [coloniasLoading, setColoniasLoading] = useState(false);
  const [coloniasError, setColoniasError] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);
  const [comps, setComps] = useState(null);
  const [compsLoading, setCompsLoading] = useState(false);
  const [compsError, setCompsError] = useState(null);

  const rowRef = React.useRef(null);

  const toggleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!colonias) {
      setColoniasLoading(true);
      setTrendsLoading(true);
      setCompsLoading(true);
      setColoniasError(null);
      setTrendsError(null);
      setCompsError(null);

      try {
        if (onDrilldown) {
          const c = await onDrilldown(city.estado, city.ciudad);
          setColonias(c || []);
        }
      } catch { setColoniasError('Error al cargar colonias'); setColonias([]); } finally { setColoniasLoading(false); }

      try {
        const t = await getOfferTrends(city.estado, city.ciudad, undefined, listingType, 12);
        setTrends(t ? [t] : null);
      } catch { setTrendsError('Error al cargar tendencias'); setTrends(null); } finally { setTrendsLoading(false); }

      try {
        const co = await getComps(city.estado, city.ciudad, undefined, listingType, 5);
        setComps(co || []);
      } catch { setCompsError('Error al cargar comparables'); setComps([]); } finally { setCompsLoading(false); }
    }

    setTimeout(() => {
      rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <>
      <tr
        onClick={toggleExpand}
        className={`border-b border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
          expanded ? 'bg-clay-50 dark:bg-clay-900/10' : ''
        }`}
      >
        <td className="py-2 px-1.5 font-medium text-neutral-900 dark:text-neutral-100 sticky left-0 bg-inherit whitespace-nowrap">
          {city.ciudad}
        </td>
        <td className="py-2 px-1.5 text-neutral-700 dark:text-neutral-300">{formatNumber(city.activeListings)}</td>
        <td className="py-2 px-1.5 text-neutral-700 dark:text-neutral-300">{formatCurrency(city.medianOfferPerSqm)}</td>
        <td className="py-2 px-1.5">
          <span className={`font-medium ${(city.momChange || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {city.momChange != null ? `${city.momChange > 0 ? '+' : ''}${city.momChange.toFixed(1)}%` : '—'}
          </span>
        </td>
        <td className="py-2 px-1.5 text-neutral-700 dark:text-neutral-300">{formatNumber(city.medianDaysToOffer)}</td>
        <td className="py-2 px-1.5 text-neutral-700 dark:text-neutral-300">{city.avgOffersPerProperty?.toFixed(1) || '—'}</td>
        <td className="py-2 px-1.5 text-neutral-700 dark:text-neutral-300">{formatPercentage(city.acceptanceRate)}</td>
        <td className="py-2 px-1.5">
          {city.staleCount > 0 ? (
            <span className="text-red-600 dark:text-red-400 font-medium">{city.staleCount}</span>
          ) : (
            <span className="text-neutral-400">0</span>
          )}
        </td>
        <td className="py-2 px-1.5">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
            (city.activityScore || 0) >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            (city.activityScore || 0) >= 4 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
            'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          }`}>
            {city.activityScore?.toFixed(1) || '—'}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr ref={rowRef}>
          <td colSpan={9} className="bg-neutral-50 dark:bg-neutral-900/50 p-0">
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {city.ciudad} — desglose por colonia
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <OfferTrendChart trends={trends} loading={trendsLoading} error={trendsError} />
                </div>
                <div>
                  <CompsPanel comps={comps} loading={compsLoading} error={compsError} />
                </div>
              </div>

              <ColoniaTable colonias={colonias} loading={coloniasLoading} ciudad={city.ciudad} error={coloniasError} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const CityRow = React.memo(CityRowInner);

function ColoniaTable({ colonias, loading, ciudad, error }) {
  if (loading) {
    return (
      <div className="space-y-1 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-red-500 dark:text-red-400 py-2">{error}</p>;
  }

  if (!colonias || colonias.length === 0) {
    return <p className="text-xs text-neutral-400 py-4">Sin datos por colonia para {ciudad}.</p>;
  }

  const sorted = [...colonias].sort((a, b) => (b.medianOfferPerSqm || 0) - (a.medianOfferPerSqm || 0));

  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
        Colonias en {ciudad} ({sorted.length})
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
              <th className="py-1.5 px-2 text-left font-medium">Colonia</th>
              <th className="py-1.5 px-2 text-right font-medium">Activos</th>
              <th className="py-1.5 px-2 text-right font-medium">Of/m²</th>
              <th className="py-1.5 px-2 text-right font-medium">Días</th>
              <th className="py-1.5 px-2 text-right font-medium">Ofertas</th>
              <th className="py-1.5 px-2 text-right font-medium">Acept%</th>
              <th className="py-1.5 px-2 text-right font-medium">Estanc</th>
              <th className="py-1.5 px-2 text-right font-medium">Tendencia</th>
              <th className="py-1.5 px-2 text-right font-medium">Comps</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((col) => (
              <tr key={col.colonia} className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="py-1.5 px-2 font-medium text-neutral-800 dark:text-neutral-200">{col.colonia}</td>
                <td className="py-1.5 px-2 text-right text-neutral-600 dark:text-neutral-400">{formatNumber(col.activeListings)}</td>
                <td className="py-1.5 px-2 text-right text-neutral-700 dark:text-neutral-300">{formatCurrency(col.medianOfferPerSqm)}</td>
                <td className="py-1.5 px-2 text-right text-neutral-600 dark:text-neutral-400">{formatNumber(col.medianDaysToOffer)}</td>
                <td className="py-1.5 px-2 text-right text-neutral-600 dark:text-neutral-400">{col.totalOffers != null ? formatNumber(col.totalOffers) : '—'}</td>
                <td className="py-1.5 px-2 text-right text-neutral-700 dark:text-neutral-300">{formatPercentage(col.acceptanceRate)}</td>
                <td className="py-1.5 px-2 text-right">
                  {col.staleCount > 0 ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">{col.staleCount}</span>
                  ) : (
                    <span className="text-neutral-400">0</span>
                  )}
                </td>
                <td className="py-1.5 px-2 text-right">
                  <span className={`font-medium ${(col.momChange || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {col.momChange != null ? `${col.momChange > 0 ? '+' : ''}${col.momChange.toFixed(1)}%` : '—'}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right text-neutral-400">{col.compCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompsPanel({ comps, loading, error }) {
  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg animate-pulse">
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-5 bg-neutral-100 dark:bg-neutral-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Ofertas recientes</h4>
        <p className="text-xs text-red-500 dark:text-red-400 py-2">{error}</p>
      </div>
    );
  }

  if (!comps || comps.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Ofertas recientes</h4>
        <p className="text-xs text-neutral-400 py-6 text-center">Sin ofertas comparables aún.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
        Ofertas comparables ({comps.length})
      </h4>
      <div className="space-y-2">
        {comps.slice(0, 5).map((comp, i) => (
          <div key={i} className="flex items-center justify-between text-xs border-b border-neutral-100 dark:border-neutral-700 pb-1.5 last:border-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{comp.propertyTitle}</p>
              <p className="text-neutral-400 truncate">{comp.propertyType}{comp.m2 ? ` · ${comp.m2}m²` : ''}{comp.pricePerSqm ? ` · ${formatCurrency(comp.pricePerSqm)}/m²` : ''}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatCurrency(comp.offerAmount)}</p>
              <p className={`text-xs ${comp.status === 'accepted' ? 'text-green-600 dark:text-green-400' : comp.status === 'rejected' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {comp.status === 'accepted' ? 'Aceptada' : comp.status === 'rejected' ? 'Rechazada' : comp.status === 'countered' ? 'Contraoferta' : comp.status}
                {comp.offeredAt ? ` · ${formatDate(comp.offeredAt)}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
