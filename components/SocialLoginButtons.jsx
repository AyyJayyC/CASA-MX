"use client";

/**
 * SocialLoginButtons
 * Loads each OAuth provider's SDK only when the user clicks its button.
 * No third-party script is requested on page load (privacy).
 */

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

// Module-level cache: one script per id per page, shared across instances.
const scriptPromises = {};

function loadScript(id, src) {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("No document"));
  }
  if (scriptPromises[id]) return scriptPromises[id];

  scriptPromises[id] = new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      delete scriptPromises[id];
      reject(new Error(`Failed to load ${id}`));
    };
    document.head.appendChild(script);
  });

  return scriptPromises[id];
}

let fbInited = false;

const SocialLoginButtons = React.memo(function SocialLoginButtons({
  redirectTo = "/properties",
  onError,
}) {
  const { loginWithGoogle, loginWithFacebook, loginWithApple } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const fail = (err, fallback) => {
    setLoading(false);
    if (onError) onError(err?.message || fallback);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loadScript("gsi-script", "https://accounts.google.com/gsi/client");
      const google = window.google;
      if (!google?.accounts?.id) throw new Error("Google no disponible");

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            router.push(redirectTo);
          } catch (err) {
            fail(err, "Error al iniciar sesión con Google");
          }
        },
      });
      // ponytail: One Tap prompt is the headless GSI entry point; if it ever
      // stops appearing, fall back to renderButton inside a modal.
      google.accounts.id.prompt();
    } catch (err) {
      fail(err, "Error al iniciar sesión con Google");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      await loadScript(
        "fb-sdk-script",
        "https://connect.facebook.net/es_LA/sdk.js",
      );
      if (!window.FB) throw new Error("Facebook no disponible");
      if (!fbInited) {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        });
        fbInited = true;
      }
      window.FB.login(
        async (response) => {
          if (response.authResponse) {
            try {
              await loginWithFacebook(response.authResponse.accessToken);
              router.push(redirectTo);
            } catch (err) {
              fail(err, "Error al iniciar sesión con Facebook");
            }
          } else {
            setLoading(false);
          }
        },
        { scope: "email,public_profile" },
      );
    } catch (err) {
      fail(err, "Error al iniciar sesión con Facebook");
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await loadScript(
        "apple-sdk-script",
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
      );
      if (!window.AppleID) throw new Error("Apple no disponible");

      const response = await window.AppleID.auth.signIn({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI:
          typeof window !== "undefined" ? window.location.origin : "",
        usePopup: true,
      });
      if (response.authorization) {
        const { id_token, code } = response.authorization;
        const fullName = response.user?.name
          ? [response.user.name.firstName, response.user.name.lastName]
              .filter(Boolean)
              .join(" ")
          : "";
        await loginWithApple(id_token, code, fullName);
        router.push(redirectTo);
      } else {
        setLoading(false);
      }
    } catch (err) {
      fail(err, "Error al iniciar sesión con Apple");
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

      {/* Google Button */}
      {GOOGLE_CLIENT_ID && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:hover:bg-neutral-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          Continuar con Google
        </button>
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
});

SocialLoginButtons.displayName = "SocialLoginButtons";
export default SocialLoginButtons;
