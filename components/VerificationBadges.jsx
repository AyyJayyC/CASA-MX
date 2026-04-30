'use client';

import React from 'react';

export default function VerificationBadges({
  identityVerified = false,
  paidSubscriber = false,
  identityUploaded = false,
  compact = false,
}) {
  const baseClass = compact
    ? 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium'
    : 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {identityVerified ? (
        <span className={`${baseClass} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300`}>
          <span aria-hidden="true">✓</span>
          Identidad verificada
        </span>
      ) : identityUploaded ? (
        <span className={`${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>
          <span aria-hidden="true">⏳</span>
          ID subida
        </span>
      ) : null}

      {paidSubscriber && (
        <span className={`${baseClass} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`}>
          <span aria-hidden="true">✓</span>
          Suscripcion activa
        </span>
      )}
    </div>
  );
}
