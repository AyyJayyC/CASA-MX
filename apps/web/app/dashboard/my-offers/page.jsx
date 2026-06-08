"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import OfferRespondModal from "@/components/OfferRespondModal.jsx";

import { getMyBuyerOffers } from "@/lib/api/offers.js";

const STATUS_LABELS = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  countered: "En negociación",
};

const STATUS_COLORS = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  countered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function MyOffersPage() {
  return (
    <RequireRole roles={["buyer", "admin"]}>
      <MyOffersContent />
    </RequireRole>
  );
}

function MyOffersContent() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBuyerOffers();
      setOffers(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar tus ofertas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedOffers = useMemo(() => {
    return [...offers].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    );
  }, [offers]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Mis ofertas y negociaciones
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Sigue el historial completo de tus ofertas y responde
              contraofertas del vendedor.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-clay dark:text-clay hover:underline"
          >
            ← Inicio
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-neutral-400">
            Cargando ofertas...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : sortedOffers.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">Aún no has enviado ofertas.</p>
            <p className="text-sm mt-1">
              Cuando envíes ofertas sobre propiedades en venta, aparecerán aquí.
            </p>
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
                      className="text-base font-semibold text-neutral-900 dark:text-neutral-100 hover:text-clay dark:hover:text-clay-400 line-clamp-1"
                    >
                      {offer.property?.title ?? "Propiedad"}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {offer.property?.colonia}, {offer.property?.estado}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[offer.status] ?? ""}`}
                  >
                    {STATUS_LABELS[offer.status] ?? offer.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Tu oferta inicial
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      ${Number(offer.offerAmount || 0).toLocaleString("es-MX")}{" "}
                      MXN
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Última propuesta
                    </div>
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      $
                      {Number(
                        offer.latestAmount ||
                          offer.counterAmount ||
                          offer.offerAmount ||
                          0,
                      ).toLocaleString("es-MX")}{" "}
                      MXN
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Rondas de contraoferta
                    </div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {counterCount(offer)}
                    </div>
                  </div>
                </div>

                {offer.status !== "accepted" && offer.status !== "rejected" && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="px-5 py-2 rounded-lg font-semibold text-sm bg-clay hover:bg-clay-500 text-white shadow-sm transition-all"
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

      <OfferRespondModal
        isOpen={!!selectedOffer}
        offer={selectedOffer}
        perspective="buyer"
        onClose={() => setSelectedOffer(null)}
        onResponded={() => {
          setSelectedOffer(null);
          load();
        }}
      />
    </div>
  );
}
