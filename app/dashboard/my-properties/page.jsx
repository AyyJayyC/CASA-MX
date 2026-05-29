'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';
import { getMyProperties } from '@/lib/api/properties';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

const SALE_RENT_LABELS = { for_sale: 'Venta', for_rent: 'Renta' };

const TABS = [
  { key: '', label: 'Todas' },
  { key: 'incompleto', label: 'Borradores' },
  { key: 'disponible', label: 'Publicadas' },
  { key: 'vendido', label: 'Vendidas' },
  { key: 'rentado', label: 'Rentadas' },
];

function DraftCard({ property }) {
  let warnings = [];
  try { warnings = JSON.parse(property.inventoryNotes || '{}')?.warnings || []; } catch {}
  const photoCount = property.imageUrls?.length || 0;

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{property.title}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{property.colonia}, {property.ciudad}</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
          ⚠️ Borrador
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <span>{SALE_RENT_LABELS[property.listingType] || 'Venta'}</span>
        {property.listingType === 'for_sale' && <span className="font-medium">{formatCurrency(property.price)}</span>}
        {property.listingType === 'for_rent' && <span className="font-medium">{formatCurrency(property.monthlyRent)}/mes</span>}
        <span>{formatNumber(property.squareMeters)} m²</span>
        <span className={photoCount === 0 ? 'text-red-500 font-medium' : ''}>{photoCount} fotos</span>
      </div>

      {warnings.length > 0 && (
        <div className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
          {warnings.slice(0, 3).map((w, i) => <p key={i}>⚠️ {w}</p>)}
          {warnings.length > 3 && <p className="text-amber-500">+{warnings.length - 3} más</p>}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Link
          href={`/properties/${property.id}?edit=true`}
          className="px-3 py-1.5 text-xs font-medium bg-clay hover:bg-clay-500 text-white rounded-lg transition-colors"
        >
          Completar
        </Link>
      </div>
    </div>
  );
}

function PropertyCard({ property }) {
  const photoCount = property.imageUrls?.length || 0;
  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{property.title}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{property.colonia}, {property.ciudad}</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          {property.status === 'disponible' ? '✅ Publicada' : property.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <span>{SALE_RENT_LABELS[property.listingType] || 'Venta'}</span>
        {property.listingType === 'for_sale' && <span className="font-medium">{formatCurrency(property.price)}</span>}
        {property.listingType === 'for_rent' && <span className="font-medium">{formatCurrency(property.monthlyRent)}/mes</span>}
        <span>{formatNumber(property.squareMeters)} m²</span>
        <span>{photoCount} fotos</span>
      </div>

      <Link
        href={`/properties/${property.id}`}
        className="inline-block text-xs font-medium text-clay hover:text-clay-500 transition-colors"
      >
        Ver detalles →
      </Link>
    </div>
  );
}

export default function MyPropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setError(null);

    const filters = { limit: 100 };
    if (tab === 'incompleto') {
      filters.status = 'incompleto';
      filters.visibility = 'private';
    } else if (tab) {
      filters.status = tab;
    }

    getMyProperties(filters)
      .then(data => setProperties(data || []))
      .catch(() => setError('No se pudieron cargar tus propiedades'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, tab]);

  if (!isAuthenticated) {
    return <div className="p-10 text-center text-neutral-500">Inicia sesión para ver tus propiedades.</div>;
  }

  const drafts = properties.filter(p => p.status === 'incompleto');
  const published = properties.filter(p => p.status !== 'incompleto');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Mis Propiedades</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-clay text-white shadow-sm'
                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-clay'
            }`}
          >
            {t.label}
            {t.key === 'incompleto' && drafts.length > 0 && ` (${drafts.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-medium text-neutral-600 dark:text-neutral-400">No tienes propiedades aún.</p>
          <Link href="/publish-property" className="text-sm text-clay hover:underline mt-2 inline-block">
            Publicar primera propiedad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(p =>
            p.status === 'incompleto'
              ? <DraftCard key={p.id} property={p} />
              : <PropertyCard key={p.id} property={p} />
          )}
        </div>
      )}
    </div>
  );
}
