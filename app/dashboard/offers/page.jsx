'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import { getMySellerOffers, respondToOffer } from '@/lib/api/offers.js';
import { useCredits } from '@/lib/auth/CreditsContext';

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  countered: 'Contraoferta enviada',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const FINANCING_LABELS = {
  cash: '💵 Efectivo',
  bankLoan: '🏦 Crédito bancario',
  INFONAVIT: '🏠 INFONAVIT',
  FOVISSSTE: '💼 FOVISSSTE',
  paymentPlan: '📅 Plan de pagos',
  other: '✅ Otro',
};

export default function SellerOffersPage() {
  return (
    <RequireRole roles={['seller', 'wholesaler', 'admin']}>
      <SellerOffersContent />
    </RequireRole>
  );
}

function SellerOffersContent() {
  const { spend } = useCredits();
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [respondForm, setRespondForm] = useState({ status: '', sellerNote: '', counterAmount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [respondError, setRespondError] = useState(null);
  // Contacts revealed during this session (after spending a credit).
  // API also returns non-null buyerEmail/buyerPhone for offers already unlocked in previous sessions.
  const [unlockedContacts, setUnlockedContacts] = useState({});
  const [unlocking, setUnlocking] = useState(null); // offerId being unlocked

  const getBuyerContact = (offer) =>
    unlockedContacts[offer.id] ??
    (offer.buyerEmail ? { email: offer.buyerEmail, phone: offer.buyerPhone } : null);

  const handleUnlockOffer = async (offer) => {
    setUnlocking(offer.id);
    try {
      const result = await spend(offer.id, 'offer');
      if (result.success && result.contact) {
        setUnlockedContacts((prev) => ({ ...prev, [offer.id]: { email: result.contact.email, phone: result.contact.phone } }));
      }
    } catch (err) {
      if (err.status === 402) {
        alert('Saldo insuficiente. Ve a Créditos para comprar más.');
      } else {
        alert(err.message || 'Error al desbloquear contacto');
      }
    } finally {
      setUnlocking(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMySellerOffers();
      setOffers(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = filter === 'all' ? offers : offers.filter((o) => o.status === filter);

  const openRespond = (offer) => {
    setSelectedOffer(offer);
    setRespondForm({ status: '', sellerNote: '', counterAmount: '' });
    setRespondError(null);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!respondForm.status) { setRespondError('Selecciona una acción.'); return; }
    if (respondForm.status === 'countered' && !respondForm.counterAmount) {
      setRespondError('Ingresa el monto de la contraoferta.'); return;
    }
    setSubmitting(true);
    try {
      const updated = await respondToOffer(selectedOffer.id, {
        status: respondForm.status,
        sellerNote: respondForm.sellerNote || undefined,
        counterAmount: respondForm.counterAmount ? parseFloat(respondForm.counterAmount) : undefined,
      });
      setOffers((prev) => prev.map((o) => (o.id === selectedOffer.id ? { ...o, ...updated } : o)));
      setSelectedOffer(null);
    } catch (err) {
      setRespondError(err.message || 'Error al responder');
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Ofertas de compra
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Gestiona las ofertas que has recibido en tus propiedades en venta.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'accepted', 'countered', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-amber-400'
                }
              `}
            >
              {f === 'all' ? 'Todas' : STATUS_LABELS[f]}
              {f === 'all' ? ` (${offers.length})` : ` (${offers.filter((o) => o.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-neutral-400">Cargando ofertas...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No hay ofertas {filter !== 'all' ? `con estado "${STATUS_LABELS[filter]}"` : 'todavía'}</p>
            <p className="text-sm mt-1">Las ofertas aparecerán aquí cuando compradores interesados las envíen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((offer) => (
              <div
                key={offer.id}
                className="
                  bg-white dark:bg-neutral-900
                  border border-neutral-200 dark:border-neutral-800
                  rounded-xl p-5
                  space-y-4
                "
              >
                {/* Property + status row */}
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

                {/* Offer details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Oferta</div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      ${offer.offerAmount.toLocaleString('es-MX')} MXN
                    </div>
                    {offer.property?.price && (
                      <div className="text-xs text-neutral-400">
                        Lista: ${offer.property.price.toLocaleString('es-MX')}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Financiamiento</div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {FINANCING_LABELS[offer.financing] ?? offer.financing}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Comprador</div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">{offer.buyerName}</div>
                    {getBuyerContact(offer) ? (
                      <>
                        <div className="text-xs text-neutral-400">{getBuyerContact(offer).email}</div>
                        <div className="text-xs text-neutral-400">{getBuyerContact(offer).phone}</div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUnlockOffer(offer)}
                        disabled={unlocking === offer.id}
                        className="mt-0.5 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 disabled:opacity-50"
                      >
                        🔓 {unlocking === offer.id ? 'Desbloqueando...' : 'Ver contacto (1 crédito)'}
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Fecha</div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {new Date(offer.createdAt).toLocaleDateString('es-MX')}
                    </div>
                    {offer.closingDate && (
                      <div className="text-xs text-neutral-400">
                        Cierre: {new Date(offer.closingDate).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment plan details */}
                {offer.financing === 'paymentPlan' && offer.cuotaMensual && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                    {offer.enganche > 0 && (
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Enganche: <strong>${offer.enganche.toLocaleString('es-MX')} MXN</strong>
                      </span>
                    )}
                    {offer.plazoMeses && (
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Plazo: <strong>{offer.plazoMeses} meses</strong>
                      </span>
                    )}
                    <span className="text-amber-700 dark:text-amber-400">
                      Cuota mensual: <strong>${offer.cuotaMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</strong>
                    </span>
                  </div>
                )}

                {/* Message */}
                {offer.message && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-4 py-3 italic">
                    "{offer.message}"
                  </p>
                )}

                {/* Counter / seller note */}
                {offer.status === 'countered' && offer.counterAmount && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3">
                    <span>Tu contraoferta:</span>
                    <span className="font-bold">${offer.counterAmount.toLocaleString('es-MX')} MXN</span>
                  </div>
                )}
                {offer.sellerNote && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-right italic">
                    Nota tuya: "{offer.sellerNote}"
                  </p>
                )}

                {offer.status === 'accepted' && (
                  <div className="flex justify-end">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/contracts/sale/${offer.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar Contrato
                    </a>
                  </div>
                )}

                {/* Action buttons */}
                {offer.status === 'pending' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => openRespond(offer)}
                      className="
                        px-5 py-2 rounded-lg font-semibold text-sm
                        bg-gradient-to-br from-amber-400 to-yellow-600
                        hover:from-amber-500 hover:to-yellow-700
                        text-white shadow-sm transition-all
                      "
                    >
                      Responder oferta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOffer(null); }}
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Responder oferta
              </h2>
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl leading-none"
              >✕</button>
            </div>

            <form onSubmit={handleRespond} className="p-6 space-y-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Oferta de <span className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedOffer.buyerName}</span>:
                {' '}<span className="font-bold text-amber-600 dark:text-amber-400">${selectedOffer.offerAmount.toLocaleString('es-MX')} MXN</span>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Tu respuesta <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'accepted', label: '✅ Aceptar', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' },
                    { value: 'countered', label: '↩️ Contraofertar', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
                    { value: 'rejected', label: '❌ Rechazar', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRespondForm((f) => ({ ...f, status: opt.value }))}
                      className={`
                        py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-all
                        ${respondForm.status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-amber-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counter amount */}
              {respondForm.status === 'countered' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tu contraoferta (MXN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={respondForm.counterAmount}
                    onChange={(e) => setRespondForm((f) => ({ ...f, counterAmount: e.target.value }))}
                    placeholder="Ej. 2800000"
                    min={1}
                    className={inputClass}
                  />
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nota para el comprador
                </label>
                <textarea
                  value={respondForm.sellerNote}
                  onChange={(e) => setRespondForm((f) => ({ ...f, sellerNote: e.target.value }))}
                  rows={2}
                  placeholder="Mensaje opcional"
                  className={inputClass}
                />
              </div>

              {respondError && (
                <p className="text-sm text-red-600 dark:text-red-400">{respondError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full py-3 px-6 rounded-lg font-semibold text-sm
                  bg-gradient-to-br from-amber-400 to-yellow-600
                  hover:from-amber-500 hover:to-yellow-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-white shadow-sm transition-all
                "
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
