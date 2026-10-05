"use client";

/**
 * CookieConsentBanner
 * Truthful acknowledgement banner. It does NOT gate any script — it only
 * records that the user has read the cookie notice. CasaMX uses essential
 * auth cookies and first-party analytics, no marketing cookies.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "casamx_cookie_ack";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage blocked (private mode) — stay hidden, nothing to store.
    }
  }, []);

  if (!visible) return null;

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/95"
    >
      <div className="container max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Usamos únicamente cookies necesarias para tu sesión y analítica de
          primera parte. Puedes leer el detalle en nuestro{" "}
          <Link
            href="/cookie"
            className="underline hover:text-clay dark:hover:text-clay-400"
          >
            Aviso de Cookies
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={acknowledge}
          className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
