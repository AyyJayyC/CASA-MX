"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { apiPost } from "@/lib/api/client";

export default function EmailVerificationBanner() {
  const { isAuthenticated, user, session, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show if logged in and email not verified (check both user and session)
  const emailVerified = user?.emailVerified || session?.emailVerified;
  if (!isAuthenticated || !user || emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await apiPost("/auth/resend-verification", {});
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-clay-50 dark:bg-clay-900/20 border-b border-clay-200 dark:border-clay-800">
      <div className="container max-w-7xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-clay-800 dark:text-clay-300">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>
            <strong>Confirma tu correo electrónico</strong> — Te enviamos un
            enlace a <strong>{user.email}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setChecking(true);
              try {
                await refreshUser?.();
              } catch {}
              setChecking(false);
            }}
            disabled={checking}
            className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline disabled:opacity-50"
          >
            {checking ? "Verificando..." : "Ya verifiqué mi correo"}
          </button>
          {sent ? (
            <span className="text-xs text-green-700 dark:text-green-400 font-medium">
              ¡Correo enviado!
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-xs font-semibold text-clay-700 dark:text-clay-300 hover:underline disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Reenviar correo"}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-clay-600 dark:text-clay-400 hover:text-clay-800 dark:hover:text-clay-200"
            aria-label="Cerrar"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
