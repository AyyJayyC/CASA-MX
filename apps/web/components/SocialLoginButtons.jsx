"use client";

/**
 * SocialLoginButtons
 * Renders Google Sign-In button (and placeholder for Apple/Facebook).
 * Uses Google Identity Services (GSI) script — no extra npm dependency.
 */

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

export default function SocialLoginButtons({
  redirectTo = "/properties",
  onError,
}) {
  const { loginWithGoogle, loginWithFacebook, loginWithApple } = useAuth();
  const router = useRouter();
  const googleButtonRef = useRef(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [fbLoaded, setFbLoaded] = useState(false);
  const [appleLoaded, setAppleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById("gsi-script")) {
      setGsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
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
          if (onError)
            onError(err.message || "Error al iniciar sesión con Google");
        }
      },
    });

    window.google?.accounts?.id?.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: googleButtonRef.current.offsetWidth || 400,
      text: "continue_with",
      locale: "es",
    });
  }, [gsiLoaded, loginWithGoogle, redirectTo, router, onError]);

  // Load Facebook SDK
  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    if (document.getElementById("fb-sdk-script")) {
      setFbLoaded(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });
      setFbLoaded(true);
    };

    const script = document.createElement("script");
    script.id = "fb-sdk-script";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const handleFacebookLogin = async () => {
    if (!window.FB) return;
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          try {
            setLoading(true);
            await loginWithFacebook(response.authResponse.accessToken);
            router.push(redirectTo);
          } catch (err) {
            setLoading(false);
            if (onError)
              onError(err.message || "Error al iniciar sesión con Facebook");
          }
        }
      },
      { scope: "email,public_profile" },
    );
  };

  // Load Apple JS
  useEffect(() => {
    if (!APPLE_CLIENT_ID) return;
    if (document.getElementById("apple-sdk-script")) {
      setAppleLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "apple-sdk-script";
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setAppleLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleAppleLogin = async () => {
    if (!window.AppleID) return;
    try {
      const response = await window.AppleID.auth.signIn({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI:
          typeof window !== "undefined" ? window.location.origin : "",
        usePopup: true,
      });
      if (response.authorization) {
        setLoading(true);
        const { id_token, code } = response.authorization;
        const fullName = response.user?.name
          ? [response.user.name.firstName, response.user.name.lastName]
              .filter(Boolean)
              .join(" ")
          : "";
        await loginWithApple(id_token, code, fullName);
        router.push(redirectTo);
      }
    } catch (err) {
      setLoading(false);
      if (onError) onError(err.message || "Error al iniciar sesión con Apple");
    }
  };

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID && !APPLE_CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          o continúa con
        </span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* Google Button container */}
      {GOOGLE_CLIENT_ID && (
        <div
          ref={googleButtonRef}
          className="flex w-full justify-center"
          style={{ minHeight: 44 }}
        />
      )}

      {/* Facebook Button */}
      {FACEBOOK_APP_ID && (
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166FE5] disabled:opacity-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continuar con Facebook
        </button>
      )}

      {/* Apple Button */}
      {APPLE_CLIENT_ID && (
        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continuar con Apple
        </button>
      )}

      {loading && (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">
          Iniciando sesión...
        </p>
      )}
    </div>
  );
}
