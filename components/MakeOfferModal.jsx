'use client';
import React, { useState, useMemo } from 'react';
import { submitPropertyOffer } from '../lib/api/offers.js';

const FINANCING_OPTIONS = [
  { value: 'cash', label: '💵 Efectivo' },
  { value: 'bankLoan', label: '🏦 Crédito bancario' },
  { value: 'INFONAVIT', label: '🏠 INFONAVIT' },
  { value: 'FOVISSSTE', label: '💼 FOVISSSTE' },
  { value: 'paymentPlan', label: '📅 Plan de pagos' },
  { value: 'other', label: '✅ Otro' },
];

export default function MakeOfferModal({ propertyId, askingPrice }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    offerAmount:  askingPrice ? String(askingPrice) : '',
    financing:    '',
    closingDate:  '',
    message:      '',
    buyerName:    '',
    buyerEmail:   '',
    buyerPhone:   '',
    // payment plan
    enganche:     '',
    plazoMeses:   '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Auto-calculate monthly payment (simple, no interest)
  const cuotaMensual = useMemo(() => {
    if (form.financing !== 'paymentPlan') return null;
    const offer    = parseFloat(form.offerAmount);
    const enganche = parseFloat(form.enganche) || 0;
    const plazo    = parseInt(form.plazoMeses, 10);
    if (!offer || !plazo || plazo <= 0) return null;
    const saldo = offer - enganche;
    if (saldo <= 0) return null;
    return saldo / plazo;
  }, [form.offerAmount, form.enganche, form.plazoMeses, form.financing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.financing) { setError('Selecciona el tipo de financiamiento.'); return; }
    if (form.financing === 'paymentPlan' && (!form.plazoMeses || parseInt(form.plazoMeses, 10) <= 0)) {
      setError('Ingresa el plazo en meses.'); return;
    }

    setLoading(true);
    try {
      await submitPropertyOffer(propertyId, {
        offerAmount: parseFloat(form.offerAmount),
        financing: form.financing,
        closingDate: form.closingDate || undefined,
        message: form.message || undefined,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone,
        // payment plan
        enganche:     form.enganche   ? parseFloat(form.enganche)     : undefined,
        plazoMeses:   form.plazoMeses ? parseInt(form.plazoMeses, 10) : undefined,
        cuotaMensual: cuotaMensual    ?? undefined,
      });
      setSuccess(true);
    } catch (err) {
      if (err?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Debes verificar tu correo electrónico antes de enviar una oferta. Revisa tu correo y vuelve a intentarlo.');
      } else if (err?.code === 'INE_NOT_VERIFIED') {
        setError('Debes subir y verificar tu INE antes de enviar ofertas. Hazlo en Ajustes de perfil.');
      } else {
        setError(err.message || 'Error al enviar la oferta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setError(null);
  };

  const inputClass = `
    w-full px-3 py-2 rounded-lg border
    border-neutral-300 dark:border-neutral-700
    bg-white dark:bg-neutral-800
    text-neutral-900 dark:text-neutral-100
    placeholder-neutral-400 dark:placeholder-neutral-500
    focus:outline-none focus:ring-2 focus:ring-amber-400
    text-sm
  `;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-full py-3 px-6 rounded-lg font-semibold text-sm
          bg-gradient-to-br from-amber-400 to-yellow-600
          hover:from-amber-500 hover:to-yellow-700
          text-white shadow-sm
          transition-all
        "
      >
        Hacer una oferta
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="
            w-full max-w-md max-h-[90vh] overflow-y-auto
            bg-white dark:bg-neutral-900
            border border-neutral-200 dark:border-neutral-800
            rounded-xl shadow-2xl
          ">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Hacer una oferta
                </h2>
                {askingPrice && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Precio de lista: ${askingPrice.toLocaleString('es-MX')} MXN
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Oferta enviada
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    El vendedor revisará tu oferta y se pondrá en contacto contigo pronto.
                  </p>
                  <button
                    onClick={handleClose}
                    className="
                      mt-4 px-6 py-2 rounded-lg font-medium text-sm
                      bg-neutral-100 dark:bg-neutral-800
                      hover:bg-neutral-200 dark:hover:bg-neutral-700
                      text-neutral-800 dark:text-neutral-200
                      transition-colors
                    "
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Offer Amount */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Tu oferta (MXN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="offerAmount"
                      value={form.offerAmount}
                      onChange={handleChange}
                      required
                      min={1}
                      placeholder="Ej. 2500000"
                      className={inputClass}
                    />
                  </div>

                  {/* Financing */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Tipo de financiamiento <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="financing"
                      value={form.financing}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Seleccionar...</option>
                      {FINANCING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ── Payment plan extra fields ── */}
                  {form.financing === 'paymentPlan' && (
                    <div className="space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <div className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                        Detalles del plan de pagos
                      </div>

                      {/* Enganche */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Enganche / Pago inicial (MXN)
                        </label>
                        <input
                          type="number" name="enganche" value={form.enganche}
                          onChange={handleChange} min={0}
                          placeholder="Ej. 500000"
                          className={inputClass}
                        />
                      </div>

                      {/* Plazo */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Plazo (meses) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number" name="plazoMeses" value={form.plazoMeses}
                          onChange={handleChange} min={1} max={360}
                          placeholder="Ej. 120"
                          className={inputClass}
                        />
                      </div>

                      {/* Auto-calculated monthly payment */}
                      {cuotaMensual !== null && (
                        <div className="rounded-lg bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 px-4 py-3 flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Pago mensual estimado
                          </span>
                          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            ${cuotaMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        * Sin intereses. Plazo y condiciones finales sujetos a acuerdo con el vendedor.
                      </p>
                    </div>
                  )}

                  {/* Target close date */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Fecha tentativa de cierre
                    </label>
                    <input
                      type="date"
                      name="closingDate"
                      value={form.closingDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputClass}
                    />
                  </div>

                  {/* Divider */}
                  <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 pt-2">
                    Tu información de contacto
                  </div>

                  {/* Buyer name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="buyerName"
                      value={form.buyerName}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="buyerEmail"
                      value={form.buyerEmail}
                      onChange={handleChange}
                      required
                      placeholder="correo@ejemplo.com"
                      className={inputClass}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="buyerPhone"
                      value={form.buyerPhone}
                      onChange={handleChange}
                      required
                      placeholder="5512345678"
                      className={inputClass}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Mensaje al vendedor
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Condiciones adicionales, preguntas, etc."
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full py-3 px-6 rounded-lg font-semibold text-sm
                      bg-gradient-to-br from-amber-400 to-yellow-600
                      hover:from-amber-500 hover:to-yellow-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-white shadow-sm transition-all
                    "
                  >
                    {loading ? 'Enviando...' : 'Enviar oferta'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
