"use client";

import { useState } from "react";
import { respondToOffer } from "@/lib/api/offers";
import MoneyInput from "./MoneyInput";

const inputClass =
  "w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-clay-400";

export default function OfferRespondModal({
  isOpen,
  onClose,
  offer,
  perspective = "owner", // 'owner' | 'client'
  onResponded,
}) {
  const [respondForm, setRespondForm] = useState({
    status: "",
    counterAmount: 0,
    note: "",
    proposedFurnishedStatus: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [respondError, setRespondError] = useState(null);

  if (!isOpen || !offer) return null;

  const isSeller = perspective === "owner";
  const title = isSeller ? "Responder oferta" : "Responder negociación";
  const noteLabel = isSeller ? "Nota para el comprador" : "Mensaje";
  const noteFieldKey = isSeller ? "sellerNote" : "message";
  const amountText = isSeller
    ? `Oferta de ${offer.buyerName}:`
    : "Última propuesta:";
  const amountValue = isSeller
    ? offer.offerAmount
    : Number(
        offer.latestAmount || offer.counterAmount || offer.offerAmount || 0,
      );

  const handleRespond = async (e) => {
    e.preventDefault();
    setRespondError(null);

    if (!respondForm.status) {
      setRespondError("Selecciona una acción.");
      return;
    }
    if (respondForm.status === "countered" && !respondForm.counterAmount) {
      setRespondError("Ingresa el monto de la contraoferta.");
      return;
    }

    try {
      setSubmitting(true);
      await respondToOffer(offer.id, {
        status:
          respondForm.status === "countered" ? "countered" : respondForm.status,
        counterAmount: respondForm.counterAmount || undefined,
        [noteFieldKey]: respondForm.note || undefined,
        proposedFurnishedStatus:
          respondForm.proposedFurnishedStatus || undefined,
      });
      onResponded?.();
      onClose?.();
    } catch (err) {
      setRespondError(err.message || "Error al responder");
    } finally {
      setSubmitting(false);
    }
  };

  const actionButtons = [
    { value: "accepted", label: "✅ Aceptar" },
    { value: "countered", label: "↩️ Contraofertar" },
    { value: "rejected", label: "❌ Rechazar" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleRespond} className="p-6 space-y-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {isSeller ? (
              <>
                {amountText}{" "}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {offer.buyerName}
                </span>
                :{" "}
              </>
            ) : (
              amountText
            )}
            <span className="font-bold text-clay-600 dark:text-clay-400">
              ${amountValue.toLocaleString("es-MX")} MXN
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Tu respuesta <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {actionButtons.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setRespondForm((f) => ({
                      ...f,
                      status: opt.value === respondForm.status ? "" : opt.value,
                    }))
                  }
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-all
                    ${
                      respondForm.status === opt.value
                        ? "border-clay-400 ring-2 ring-offset-1 ring-clay-400 text-neutral-900 dark:text-neutral-100"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(respondForm.status === "countered" ||
            respondForm.status === "accepted") && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Condición de muebles / electrodomésticos
              </label>
              <select
                value={respondForm.proposedFurnishedStatus}
                onChange={(e) =>
                  setRespondForm((f) => ({
                    ...f,
                    proposedFurnishedStatus: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">Sin cambios (mantener actual)</option>
                <option value="amueblada">
                  Amueblada (muebles + electrodomésticos)
                </option>
                <option value="equipada">
                  Equipada (solo electrodomésticos)
                </option>
                <option value="sin_muebles">Sin muebles</option>
              </select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Propuesta sobre qué incluye la propiedad en el precio negociado.
              </p>
            </div>
          )}

          {respondForm.status === "countered" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tu contraoferta (MXN) <span className="text-red-500">*</span>
              </label>
              <MoneyInput
                value={respondForm.counterAmount}
                onChange={(num) =>
                  setRespondForm((f) => ({ ...f, counterAmount: num ?? 0 }))
                }
                placeholder="Ej. 2800000"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {noteLabel}
            </label>
            <textarea
              value={respondForm.note}
              onChange={(e) =>
                setRespondForm((f) => ({ ...f, note: e.target.value }))
              }
              rows={2}
              placeholder="Mensaje opcional"
              className={inputClass}
            />
          </div>

          {respondError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {respondError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-lg font-semibold text-sm bg-gradient-to-br from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-all"
          >
            {submitting ? "Enviando..." : "Confirmar respuesta"}
          </button>
        </form>
      </div>
    </div>
  );
}
