'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';
import { getMyProperties, updateProperty } from '@/lib/api/properties';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

const SALE_RENT_LABELS = { for_sale: 'Venta', for_rent: 'Renta' };

const TABS = [
  { key: '', label: 'Todas' },
  { key: 'incompleto', label: 'Borradores' },
  { key: 'disponible', label: 'Publicadas' },
  { key: 'vendido', label: 'Vendidas' },
  { key: 'rentado', label: 'Rentadas' },
];

const STATUS_ORDER = ['disponible', 'rentado', 'vendido', 'retirado', 'incompleto'];

const LISTING_TYPE_FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'for_sale', label: 'Venta' },
  { key: 'for_rent', label: 'Renta' },
];

const RETIRE_REASONS = [
  { value: 'precio_alto', label: 'Precio fuera de mercado', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { value: 'sin_interes', label: 'Falta de interés', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  { value: 'vendida_fuera', label: 'Se vendió por fuera', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'retirada_dueno', label: 'El propietario desistió', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 'duplicada', label: 'Registro duplicado', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'datos_erroneos', label: 'Datos erróneos', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'captacion_termino', label: 'Captación se terminó (180 días)', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'otro', label: 'Otro motivo', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
];

const REASON_LABELS = Object.fromEntries(RETIRE_REASONS.map(r => [r.value, r.label]));
const REASON_COLORS = Object.fromEntries(RETIRE_REASONS.map(r => [r.value, r.color]));

function RetireModal({ propertyId, propertyTitle, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRetire = async () => {
    setSaving(true);
    try {
      await updateProperty(propertyId, {
        status: 'retirado',
        visibility: 'private',
        inventoryNotes: JSON.stringify({ retiredReason: reason, retiredNote: note, retiredAt: new Date().toISOString() }),
      });
      onDone(propertyId);
    } catch { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">¿Por qué retiras esta propiedad?</h3>
        <p className="text-xs text-neutral-400 truncate">{propertyTitle}</p>

        <div className="space-y-1.5">
          {RETIRE_REASONS.map(r => (
            <label key={r.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
              reason === r.value
                ? 'border-clay bg-clay/5 dark:bg-clay/10 dark:border-clay-400'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-clay/50'
            }`}>
              <input type="radio" name="retire-reason" value={r.value} checked={reason === r.value} onChange={e => setReason(e.target.value)} className="accent-clay" />
              {r.label}
            </label>
          ))}
        </div>

        <textarea
          placeholder="Notas adicionales (opcional)"
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-xs font-medium border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
          <button onClick={handleRetire} disabled={!reason || saving}
            className="flex-1 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Retirando...' : 'Retirar propiedad'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DraftCard({ property, onRetire }) {
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
          href={`/properties/${property.id}/edit`}
          className="px-3 py-1.5 text-xs font-medium bg-clay hover:bg-clay-500 text-white rounded-lg transition-colors"
        >
          Completar
        </Link>
        <button
          onClick={() => onRetire(property)}
          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
        >
          Retirar
        </button>
      </div>
    </div>
  );
}

function PropertyCard({ property, onRetire }) {
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
      <div className="flex items-center gap-2 pt-1">
        <Link href={`/properties/${property.id}`}
          className="text-xs font-medium text-clay hover:text-clay-500 transition-colors">
          Ver detalles →
        </Link>
        {property.status !== 'retirado' && (
          <button onClick={() => onRetire(property)}
            className="ml-auto px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors">
            Retirar
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyPropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retireTarget, setRetireTarget] = useState(null);

  const handleOpenRetire = (property) => setRetireTarget(property);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setError(null);
    const filters = { limit: 100 };
    if (tab === 'incompleto') { filters.status = 'incompleto'; filters.visibility = 'private'; }
    else if (tab) { filters.status = tab; }
    getMyProperties(filters)
      .then(data => setProperties(data || []))
      .catch(() => setError('No se pudieron cargar tus propiedades'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, tab]);

  const handleRetireDone = (id) => {
    setProperties(p => p.filter(prop => prop.id !== id));
    setRetireTarget(null);
  };

  if (!isAuthenticated) {
    return <div className="p-10 text-center text-neutral-500">Inicia sesión para ver tus propiedades.</div>;
  }

  // Sort by status priority, then by most recently created
  const sorted = [...properties].sort((a, b) => {
    const aIdx = STATUS_ORDER.indexOf(a.status);
    const bIdx = STATUS_ORDER.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply listing type filter
  const filtered = listingTypeFilter
    ? sorted.filter(p => p.listingType === listingTypeFilter)
    : sorted;

  const drafts = filtered.filter(p => p.status === 'incompleto');
  const published = filtered.filter(p => p.status !== 'incompleto');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Mis Propiedades</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{filtered.length} {filtered.length === 1 ? 'propiedad' : 'propiedades'}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-clay text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-clay'
              }`}>
              {t.label}
              {t.key === 'incompleto' && drafts.length > 0 && ` (${drafts.length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {LISTING_TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setListingTypeFilter(f.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                listingTypeFilter === f.key
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-medium text-neutral-600 dark:text-neutral-400">No tienes propiedades aún.</p>
          <Link href="/publish-property" className="text-sm text-clay hover:underline mt-2 inline-block">Publicar primera propiedad</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p =>
            p.status === 'incompleto'
              ? <DraftCard key={p.id} property={p} onRetire={handleOpenRetire} />
              : <PropertyCard key={p.id} property={p} onRetire={handleOpenRetire} />
          )}
        </div>
      )}

      {retireTarget && (
        <RetireModal
          propertyId={retireTarget.id}
          propertyTitle={retireTarget.title}
          onClose={() => setRetireTarget(null)}
          onDone={handleRetireDone}
        />
      )}
    </div>
  );
}
