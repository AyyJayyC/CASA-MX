"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import Link from "next/link";
import { getMyReferralCode, getReferralStats } from "@/lib/api/referrals";

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export default function SharedPage() {
  const { user, isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      let code = user?.referralCode;
      if (!code) {
        code = await getMyReferralCode();
      }
      setReferralCode(code);

      const s = await getReferralStats();
      setStats(s);
      setLoading(false);
    };

    load();
  }, [isAuthenticated, user]);

  const handleCopyCode = () => {
    if (!referralCode) return;
    const url = `${FRONTEND_URL}/register?compartio=${referralCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Debes iniciar sesión para ver esta página.
          </p>
          <Link
            href="/login"
            className="text-clay dark:text-clay hover:underline font-medium"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Enlaces compartidos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Comparte propiedades y gana visibilidad. Tus enlaces registran clics
            y nuevas cuentas.
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Tu código de referencia
          </h2>
          {loading ? (
            <div className="animate-pulse h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          ) : referralCode ? (
            <div className="flex items-center gap-3">
              <code className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-lg font-mono font-bold text-clay dark:text-clay-400">
                {referralCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-clay hover:bg-clay-500 text-white transition-all"
              >
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              No se pudo obtener tu código.
            </p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Comparte este enlace para que otros se registren. También se genera
            automáticamente al compartir una propiedad.
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center space-y-1">
              <div className="text-3xl font-bold text-clay dark:text-clay">
                {stats.clicks || 0}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Clics totales
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center space-y-1">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.signups || 0}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Registros
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center space-y-1">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.conversionRate || 0}%
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Tasa de conversión
              </div>
            </div>
          </div>
        )}

        {/* Recent Events */}
        {stats?.recentEvents?.length > 0 && (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Actividad reciente
            </h2>
            <div className="space-y-2">
              {stats.recentEvents.slice(0, 10).map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${event.type === "click" ? "bg-blue-500" : "bg-green-500"}`}
                  />
                  <span className="capitalize">
                    {event.type === "click" ? "Clic" : "Registro"}
                  </span>
                  {event.propertyId && (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      en propiedad {event.propertyId.slice(0, 8)}...
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                    {new Date(event.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !stats?.recentEvents?.length && (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">🔗</div>
            <p className="font-medium">
              Aún no has compartido ninguna propiedad
            </p>
            <p className="text-sm mt-1">
              Comparte una propiedad para ver estadísticas aquí.
            </p>
            <Link
              href="/properties"
              className="inline-block mt-4 px-6 py-3 rounded-lg font-semibold text-sm bg-clay hover:bg-clay-500 text-white transition-all"
            >
              Explorar propiedades
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
