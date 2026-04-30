"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error | expired
  const [message, setMessage] = useState('');
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado.');
      return;
    }

    fetch(`${BACKEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || '¡Correo verificado exitosamente!');
          await refreshUser();
          // Redirect to inicio after 3 seconds
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          setStatus(data.error?.includes('expirado') ? 'expired' : 'error');
          setMessage(data.error || 'El enlace es inválido.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error al verificar. Intenta de nuevo.');
      });
  }, [token, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center shadow-sm">

        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Verificando tu correo...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">¡Correo verificado!</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">Redirigiendo a tu inicio...</p>
            <Link href="/dashboard" className="mt-4 inline-block px-6 py-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-semibold text-sm hover:from-amber-500 hover:to-yellow-700 transition-all">
              Ir al inicio
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Enlace expirado</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">El enlace de verificación ha expirado. Solicita uno nuevo.</p>
            <ResendButton />
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Enlace inválido</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
            <Link href="/dashboard" className="inline-block px-6 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Ir al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-neutral-500">Cargando...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function ResendButton() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Error al enviar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  if (sent) return <p className="text-green-600 dark:text-green-400 text-sm">¡Correo enviado! Revisa tu bandeja de entrada.</p>;

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={sending}
        className="px-6 py-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-semibold text-sm hover:from-amber-500 hover:to-yellow-700 disabled:opacity-60 transition-all"
      >
        {sending ? 'Enviando...' : 'Reenviar correo de verificación'}
      </button>
      {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
    </div>
  );
}
