"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EmailVerificationBanner() {
  const { isAuthenticated, user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show if logged in and email not verified
  if (!isAuthenticated || !user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await fetch(`${BACKEND_URL}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
      });
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="container max-w-7xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>
            <strong>Confirma tu correo electrónico</strong> — Te enviamos un enlace a <strong>{user.email}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {sent ? (
            <span className="text-xs text-green-700 dark:text-green-400 font-medium">¡Correo enviado!</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Reenviar correo'}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
