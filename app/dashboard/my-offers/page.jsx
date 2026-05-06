'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/guards/RequireRole.jsx';

import { getMyBuyerOffers, respondToOffer } from '@/lib/api/offers.js';

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  countered: 'En negociación',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function MyOffersPage() {
  return (
    <RequireRole roles={['buyer', 'admin']}>
      <MyOffersContent />
    </RequireRole>
  );
}

function MyOffersContent() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [respondForm, setRespondForm] = useState({ status: '', counterAmount: '', message: '', proposedFurnishedStatus: '' });
  const [submitting, setSubmitting] = useState(false);
  const [respondError, setRespondError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBuyerOffers();
      setOffers(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar tus ofertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canBuyerRespond = (offer) => {
    if (!offer || offer.status === 'accepted' || offer.status === 'rejected') return false;
    if (!offer.events || offer.events.length === 0) return false;
    const latest = offer.events[offer.events.length - 1];
    return latest?.actorRole === 'seller';
  };

  const counterCount = (offer) => (offer?.events || []).filter((event) => event.action === 'counter').length;

  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [offers]);

  const openRespond = (offer) => {
    setSelectedOffer(offer);
    setRespondForm({ status: '', counterAmount: '', message: '', proposedFurnishedStatus: '' });
    setRespondError(null);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!respondForm.status) {
      setRespondError('Selecciona una acción.');
      return;
    }
    if (respondForm.status === 'countered' && !respondForm.counterAmount) {
      setRespondError('Ingresa el monto de tu contraoferta.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await respondToOffer(selectedOffer.id, {
        status: respondForm.status,
        counterAmount: respondForm.counterAmount ? Number(respondForm.counterAmount) : undefined,
        message: respondForm.message || undefined,
        proposedFurnishedStatus: respondForm.proposedFurnishedStatus || undefined,
      });

      const updatedOffer = updated?.offer || updated;
      const updatedTimeline = updated?.timeline;

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === selectedOffer.id
            ? {
                ...offer,
                ...updatedOffer,
                ...(updatedTimeline ? { events: updatedTimeline } : {}),
              }
            : offer
        )
      );
      setSelectedOffer(null);
    } catch (err) {
      setRespondError(err.message || 'No se pudo responder a la negociación');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full px-3 py-2 rounded-lg border
    border-neutral-300 dark:border-neutral-700
    bg-white dark:bg-neutral-800
    text-neutral-900 dark:text-neutral-100
    focus:outline-none focus:ring-2 focus:ring-amber-400
    text-sm
  `;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Mis ofertas y negociaciones</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Sigue el historial completo de tus ofertas y responde contraofertas del vendedor.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
            ← Inicio
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-neutral-400">Cargando ofertas...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : sortedOffers.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">Aún no has enviado ofertas.</p>
            <p className="text-sm mt-1">Cuando envíes ofertas sobre propiedades en venta, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Link
                      href={`/properties/${offer.propertyId}`}
                      className="text-base font-semibold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-400 line-clamp-1"
                    >
                      {offer.property?.title ?? 'Propiedad'}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {offer.property?.colonia}, {offer.property?.estado}
                    </p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[offer.status] ?? ''}`}>
                    {STATUS_LABELS[offer.status] ?? offer.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Tu oferta inicial</div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      ${Number(offer.offerAmount || 0).toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Última propuesta</div>
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      ${Number(offer.latestAmount || offer.counterAmount || offer.offerAmount || 0).toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Rondas de contraoferta</div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{counterCount(offer)}</div>
                  </div>
                </div>



                {canBuyerRespond(offer) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => openRespond(offer)}
                      className="px-5 py-2 rounded-lg font-semibold text-sm bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-white shadow-sm transition-all"
                    >
                      Responder negociación
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOffer(null); }}>
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Responder negociación</h2>
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl leading-none"
              >✕</button>
            </div>

            <form onSubmit={handleRespond} className="p-6 space-y-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Última propuesta: <span className="font-bold text-blue-600 dark:text-blue-400">${Number(selectedOffer.latestAmount || selectedOffer.counterAmount || selectedOffer.offerAmount || 0).toLocaleString('es-MX')} MXN</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tu respuesta <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'accepted', label: '✅ Aceptar' },
                    { value: 'countered', label: '↩️ Contraofertar' },
                    { value: 'rejected', label: '❌ Rechazar' },
                  ].map((opt) => {
                    const isRejectLocked = opt.value === 'rejected' && counterCount(selectedOffer) < 2;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isRejectLocked}
                        onClick={() => setRespondForm((form) => ({ ...form, status: opt.value }))}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-all ${respondForm.status === opt.value ? 'border-amber-400 ring-2 ring-offset-1 ring-amber-400 text-neutral-900 dark:text-neutral-100' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'} ${isRejectLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {counterCount(selectedOffer) < 2 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Rechazar se habilita después de al menos 2 contraofertas en la negociación.
                  </p>
                )}
              </div>

              {(respondForm.status === 'countered' || respondForm.status === 'accepted') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Condición de muebles / electrodomésticos</label>
                  <select
                    value={respondForm.proposedFurnishedStatus}
                    onChange={(e) => setRespondForm((form) => ({ ...form, proposedFurnishedStatus: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Sin cambios (mantener actual)</option>
                    <option value="amueblada">Amueblada (muebles + electrodomésticos)</option>
                    <option value="equipada">Equipada (solo electrodomésticos)</option>
                    <option value="sin_muebles">Sin muebles</option>
                  </select>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Puedes proponer cambiar si la propiedad incluye muebles en el precio negociado.</p>
                </div>
              )}

              {respondForm.status === 'countered' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tu contraoferta (MXN) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={respondForm.counterAmount}
                    onChange={(e) => setRespondForm((form) => ({ ...form, counterAmount: e.target.value }))}
                    className={inputClass}
                    placeholder="Ej. 2750000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mensaje</label>
                <textarea
                  value={respondForm.message}
                  onChange={(e) => setRespondForm((form) => ({ ...form, message: e.target.value }))}
                  rows={2}
                  className={inputClass}
                  placeholder="Mensaje opcional"
                />
              </div>

              {respondError && <p className="text-sm text-red-600 dark:text-red-400">{respondError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-lg font-semibold text-sm bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-all"
              >
                {submitting ? 'Enviando...' : 'Confirmar respuesta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}