'use client';
import React from 'react';
import Link from 'next/link';

export default function DesktopNavLinks({
  isAuthenticated,
  isAdminUser,
  showDebugUI,
  activeRole,
  canPublish,
  propertiesDropdownOpen,
  setPropertiesDropdownOpen,
  isActivePath,
  pathname,
}) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      <Link
        href="/properties?type=for_sale"
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActivePath('/properties') && pathname?.includes('for_sale')
            ? 'bg-clay/10 text-clay'
            : 'text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800'
          }`}
      >
        Comprar
      </Link>
      <Link
        href="/properties?type=for_rent"
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActivePath('/properties') && pathname?.includes('for_rent')
            ? 'bg-clay/10 text-clay'
            : 'text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800'
          }`}
      >
        Rentar
      </Link>
      {canPublish && (
        <Link
          href="/publish-property"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActivePath('/publish-property')
              ? 'bg-clay/10 text-clay'
              : 'text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800'
            }`}
        >
          Vender
        </Link>
      )}
      {(!isAuthenticated || !canPublish) && (
        <Link
          href="/publish-property"
          className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-clay hover:bg-clay-500 text-white transition-all shadow-sm"
        >
          Publicar propiedad
        </Link>
      )}
    </nav>
  );
}
