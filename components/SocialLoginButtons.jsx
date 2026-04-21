'use client';

/**
 * SocialLoginButtons
 * Renders Google Sign-In button (and placeholder for Apple/Facebook).
 * Uses Google Identity Services (GSI) script — no extra npm dependency.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function SocialLoginButtons({ redirectTo = '/properties', onError }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const googleButtonRef = useRef(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById('gsi-script')) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Google button once GSI script is ready
  useEffect(() => {
    if (!gsiLoaded || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    window.google?.accounts?.id?.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setLoading(true);
          await loginWithGoogle(response.credential);
          router.push(redirectTo);
        } catch (err) {
          setLoading(false);
          if (onError) onError(err.message || 'Error al iniciar sesión con Google');
        }
      },
    });

    window.google?.accounts?.id?.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: googleButtonRef.current.offsetWidth || 400,
      text: 'continue_with',
      locale: 'es',
    });
  }, [gsiLoaded, loginWithGoogle, redirectTo, router, onError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">o continúa con</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* Google Button container — GSI renders into this div */}
      <div
        ref={googleButtonRef}
        className="flex w-full justify-center"
        style={{ minHeight: 44 }}
      />

      {loading && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">
          Iniciando sesión...
        </p>
      )}
    </div>
  );
}
