"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import * as negotiationsAPI from "@/lib/api/negotiations";
import MoneyInput from "./MoneyInput";

const formatMXN = (amount) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    amount,
  );

export default function NegotiationPanel({
  applicationId,
  originalRent,
  applicantId,
  landlordId,
}) {
  const { user } = useAuth();
  const [negotiation, setNegotiation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proposedRent, setProposedRent] = useState(0);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isApplicant = user?.id === applicantId;
  const isLandlord = user?.id === landlordId;
  const canParticipate = isApplicant || isLandlord;

  const load = async () => {
    try {
      const data =
        await negotiationsAPI.getNegotiationByApplication(applicationId);
      const payload = data?.data || data;
      setNegotiation(payload?.negotiation ?? data?.negotiation ?? null);
    } catch {
      // no negotiation yet
      setCanReject(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [applicationId]);

  const handleStart = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await negotiationsAPI.startNegotiation({
        rentalApplicationId: applicationId,
        proposedRent: proposedRent,
        message,
      });
      setShowForm(false);
      setProposedRent(0);
      setMessage("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounter = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await negotiationsAPI.submitCounterOffer(negotiation.id, {
        proposedRent: proposedRent,
        message,
      });
      setShowForm(false);
      setProposedRent(0);
      setMessage("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespond = async (action) => {
    setActionLoading(true);
    setError(null);
    try {
      await negotiationsAPI.respondToOffer(negotiation.id, action);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!canParticipate) return null;
  if (loading)
    return <p className="text-sm text-neutral-500">Cargando negociación...</p>;

  const latestOffer = negotiation?.offers?.slice(-1)[0];
  const isOpen = negotiation?.status === "open";
  const canRespond =
    isOpen &&
    latestOffer?.status === "pending" &&
    latestOffer?.authorId !== user?.id;
  const canCounter =
    isOpen &&
    latestOffer?.status === "pending" &&
    latestOffer?.authorId !== user?.id;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-800 dark:text-white">
          Negociación de renta
        </h3>
        {negotiation && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              negotiation.status === "accepted"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : negotiation.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-400"
            }`}
          >
            {negotiation.status === "accepted"
              ? "✓ Acordado"
              : negotiation.status === "rejected"
                ? "✗ Rechazado"
                : "En negociación"}
          </span>
        )}
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Renta original: <strong>{formatMXN(originalRent)}/mes</strong>
        {negotiation?.status === "accepted" && negotiation.finalRent && (
          <>
            {" "}
            → Acordada:{" "}
            <strong className="text-green-600 dark:text-green-400">
              {formatMXN(negotiation.finalRent)}/mes
            </strong>
          </>
        )}
      </p>

      {/* Offer history */}
      {negotiation?.offers?.length > 0 && (
        <div className="space-y-2">
          {negotiation.offers.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-lg p-3 text-sm ${
                offer.authorId === user?.id
                  ? "bg-clay-50 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 ml-4"
                  : "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mr-4"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {offer.authorRole === "tenant" ? "Inquilino" : "Propietario"}
                </span>
                <span className="font-bold text-clay-700 dark:text-clay-400">
                  {formatMXN(offer.proposedRent)}/mes
                </span>
              </div>
              {offer.message && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  {offer.message}
                </p>
              )}
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(offer.createdAt).toLocaleString("es-MX")} ·{" "}
                <span
                  className={
                    offer.status === "accepted"
                      ? "text-green-600"
                      : offer.status === "rejected"
                        ? "text-red-600"
                        : "text-neutral-400"
                  }
                >
                  {offer.status === "pending"
                    ? "Pendiente"
                    : offer.status === "accepted"
                      ? "Aceptada"
                      : offer.status === "rejected"
                        ? "Rechazada"
                        : "Contraofertada"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Actions */}
      {isApplicant &&
        !negotiation &&
        (!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-clay-600 dark:text-clay-400 hover:underline font-medium"
          >
            + Proponer otra renta
          </button>
        ) : (
          <OfferForm
            label="Proponer renta"
            proposedRent={proposedRent}
            message={message}
            onChangeRent={setProposedRent}
            onChangeMessage={setMessage}
            onSubmit={handleStart}
            onCancel={() => setShowForm(false)}
            loading={actionLoading}
          />
        ))}

      {canRespond && !showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRespond("accept")}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {actionLoading ? "..." : "Aceptar oferta"}
          </button>
          <button
            onClick={() => handleRespond("reject")}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => setShowForm(true)}
            disabled={actionLoading}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg text-sm transition-colors"
          >
            Contraofertar
          </button>
        </div>
      )}

      {showForm && negotiation && (
        <OfferForm
          label="Contraofertar"
          proposedRent={proposedRent}
          message={message}
          onChangeRent={setProposedRent}
          onChangeMessage={setMessage}
          onSubmit={handleCounter}
          onCancel={() => setShowForm(false)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function OfferForm({
  label,
  proposedRent,
  message,
  onChangeRent,
  onChangeMessage,
  onSubmit,
  onCancel,
  loading,
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
      <div>
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Renta propuesta (MXN/mes) *
        </label>
        <MoneyInput
          value={proposedRent}
          onChange={(num) => setProposedRent(num ?? 0)}
          placeholder="ej. 8500"
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-clay-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Agrega una nota o justificación..."
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-clay-400 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={loading || !proposedRent}
          className="px-4 py-2 bg-clay-500 hover:bg-clay-600 disabled:bg-clay-300 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {loading ? "Enviando..." : label}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
