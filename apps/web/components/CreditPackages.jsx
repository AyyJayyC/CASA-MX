"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useCredits } from "@/lib/auth/CreditsContext";
import * as creditsAPI from "@/lib/api/credits";

const StripePaymentModal = dynamic(() => import("./StripePaymentModal"), {
  ssr: false,
});

const stripeEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CREDIT_USES = [
  {
    icon: "👤",
    label: "Desbloquear el contacto de un comprador",
    cost: "10 créditos",
  },
  {
    icon: "🏠",
    label: "Publicar una propiedad en venta o renta",
    cost: "Gratis",
  },
  {
    icon: "⭐",
    label: "Destacar tu propiedad en búsquedas",
    cost: "300 créditos / día",
  },
  {
    icon: "🔥",
    label: "Aparecer en el carrusel de la página principal",
    cost: "2,000 créditos / día",
  },
];

// Badge shown on certain packages
const BADGES = {
  Agente: { label: "Más popular", color: "bg-clay-500 text-white" },
  Pro: { label: "Mejor valor", color: "bg-emerald-500 text-white" },
};

export default function CreditPackages() {
  const { refresh } = useCredits();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [stripeTarget, setStripeTarget] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    creditsAPI
      .getPackages()
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => setError("No se pudieron cargar los paquetes de créditos."))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (pkg) => {
    setError(null);
    setSuccess(null);
    if (stripeEnabled) {
      setStripeTarget(pkg);
      return;
    }
    setBuying(pkg.id);
    try {
      const result = await creditsAPI.fulfillPayment(pkg.id);
      await refresh();
      setSuccess(
        `¡Compra exitosa! Ahora tienes ${result.newBalance} créditos.`,
      );
    } catch (err) {
      setError(err.message || "Error al procesar el pago");
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-sm text-neutral-500 py-4">
        Cargando paquetes...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* What credits buy */}
      <div className="rounded-xl bg-clay-50 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 p-4">
        <p className="text-sm font-semibold text-clay-800 dark:text-clay-300 mb-2">
          ¿Para qué sirven los créditos?
        </p>
        <p className="text-xs text-clay-700 dark:text-clay-400 mb-3">
          Los compradores e inquilinos nunca pagan — los créditos son para
          propietarios y vendedores.
        </p>
        <ul className="space-y-1">
          {CREDIT_USES.map((u) => (
            <li
              key={u.label}
              className="flex items-center gap-2 text-sm text-clay-700 dark:text-clay-400"
            >
              <span>{u.icon}</span>
              <span className="flex-1">{u.label}</span>
              <span className="ml-auto font-bold text-clay-600 dark:text-clay-300">
                {u.cost}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {packages.map((pkg) => {
          const badge = BADGES[pkg.name];
          const perCredit = (pkg.priceMXN / pkg.credits).toFixed(0);
          const isPopular = !!badge;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-xl border p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${
                isPopular
                  ? "border-clay-400 dark:border-clay-500 bg-clay-50 dark:bg-clay-900/20"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              }`}
            >
              {badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full ${badge.color}`}
                >
                  {badge.label}
                </span>
              )}
              <div className="text-center pt-1">
                <p className="text-base font-bold text-neutral-800 dark:text-white">
                  {pkg.name}
                </p>
                <p className="text-4xl font-extrabold text-clay-600 dark:text-clay-400 mt-1">
                  {pkg.credits}
                </p>
                <p className="text-xs text-neutral-500">créditos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-neutral-800 dark:text-white">
                  ${pkg.priceMXN.toLocaleString("es-MX")}{" "}
                  <span className="text-sm font-normal text-neutral-500">
                    MXN
                  </span>
                </p>
                <p className="text-xs text-neutral-400">
                  ${perCredit} MXN por crédito
                </p>
              </div>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={buying === pkg.id}
                className={`mt-auto w-full py-2 font-semibold rounded-lg text-sm transition-colors ${
                  isPopular
                    ? "bg-clay-500 hover:bg-clay-600 disabled:bg-clay-300 text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-400 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white text-white"
                }`}
              >
                {buying === pkg.id ? "Procesando..." : "Comprar"}
              </button>
            </div>
          );
        })}
      </div>

      {stripeEnabled && stripeTarget && (
        <StripePaymentModal
          pkg={stripeTarget}
          onClose={() => setStripeTarget(null)}
          onSuccess={() => {
            setStripeTarget(null);
            setSuccess("¡Compra exitosa! Tus créditos han sido acreditados.");
          }}
          refresh={refresh}
        />
      )}
    </div>
  );
}
