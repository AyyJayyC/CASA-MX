"use client";
import React, { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { EVENT_NAMES } from "@/lib/analytics/events";
import { getMyReferralCode, trackReferralClick } from "@/lib/api/referrals";

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export default function SharePropertyButton({ propertyId, propertyTitle }) {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback(async () => {
    let code = user?.referralCode;
    if (!code && user) {
      code = await getMyReferralCode();
    }
    if (!code) return `${FRONTEND_URL}/properties/${propertyId}`;
    return `${FRONTEND_URL}/properties/${propertyId}?compartio=${code}`;
  }, [user, propertyId]);

  const handleWhatsApp = async () => {
    const url = await getShareUrl();
    if (!url) return;
    const text = encodeURIComponent(
      `Mira esta propiedad en Casa-MX.com:\n${propertyTitle}\n${url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    const code = user?.referralCode;
    if (code) {
      trackReferralClick({ referralCode: code, propertyId });
      track(EVENT_NAMES.PROPERTY_SHARED, {
        entityId: propertyId,
        metadata: { via: "whatsapp", referralCode: code },
      });
    }
    setOpen(false);
  };

  const handleCopyLink = async () => {
    const url = await getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    const code = user?.referralCode;
    if (code) {
      trackReferralClick({ referralCode: code, propertyId });
      track(EVENT_NAMES.PROPERTY_SHARED, {
        entityId: propertyId,
        metadata: { via: "copy", referralCode: code },
      });
    }
    setOpen(false);
  };

  const handleNativeShare = async () => {
    const url = await getShareUrl();
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: "Mira esta propiedad en Casa-MX.com",
          url,
        });
      } catch {}
    }
    const code = user?.referralCode;
    if (code) {
      trackReferralClick({ referralCode: code, propertyId });
      track(EVENT_NAMES.PROPERTY_SHARED, {
        entityId: propertyId,
        metadata: { via: "native", referralCode: code },
      });
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
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
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {copied ? "¡Enlace copiado!" : "Compartir"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleWhatsApp}
              className="w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors"
            >
              <span className="text-lg">💬</span>
              Compartir por WhatsApp
            </button>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors"
              >
                <span className="text-lg">📤</span>
                Compartir nativo
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 transition-colors border-t border-neutral-200 dark:border-neutral-800"
            >
              <span className="text-lg">🔗</span>
              {copied ? "¡Enlace copiado!" : "Copiar enlace"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
