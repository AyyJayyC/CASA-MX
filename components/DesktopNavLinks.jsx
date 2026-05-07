'use client';
import React from 'react';
import Link from 'next/link';

export default function DesktopNavLinks({
  isAuthenticated,
  isAdminUser,
  showDebugUI,
  isBuyerOrTenant,
  canPublish,
  propertiesDropdownOpen,
  setPropertiesDropdownOpen,
  isActivePath,
  pathname,
}) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      <div className="relative group properties-dropdown">
        <button
          onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
            ${isActivePath('/properties') || propertiesDropdownOpen
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
        >
          Propiedades
          <svg className={`w-4 h-4 transition-transform ${propertiesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        <div className={`absolute left-0 mt-0 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg transition-all duration-200 z-50
          ${propertiesDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {isBuyerOrTenant ? (
            <>
              <DropdownLink href="/properties?type=for_sale" onClick={() => setPropertiesDropdownOpen(false)} icon="money">Comprar Propiedad</DropdownLink>
              <DropdownLink href="/properties?type=for_rent" onClick={() => setPropertiesDropdownOpen(false)} icon="home">Rentar Propiedad</DropdownLink>
            </>
          ) : (
            <>
              <DropdownLink href="/properties?type=for_sale" onClick={() => setPropertiesDropdownOpen(false)} icon="money" bordered>Vender Propiedad</DropdownLink>
              <DropdownLink href="/properties?type=for_rent" onClick={() => setPropertiesDropdownOpen(false)} icon="home" bordered>Rentar Propiedad</DropdownLink>
              <DropdownLink href="/properties" onClick={() => setPropertiesDropdownOpen(false)} icon="search" bordered>Buscar Propiedades</DropdownLink>
              {isAuthenticated && canPublish && (
                <DropdownLink href="/publish-property" onClick={() => setPropertiesDropdownOpen(false)} icon="plus">Publicar Nueva Propiedad</DropdownLink>
              )}
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <Link href="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${pathname?.startsWith('/dashboard') ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
          Inicio
        </Link>
      )}

      {isAuthenticated && isAdminUser && (
        <>
          <AdminLink href="/admin/approvals" isActivePath={isActivePath}>Admin</AdminLink>
          <AdminLink href="/admin/properties" isActivePath={isActivePath}>Propiedades</AdminLink>
          {showDebugUI && <AdminLink href="/admin/debug" isActivePath={isActivePath}>Debug</AdminLink>}
        </>
      )}
    </nav>
  );
}

function DropdownLink({ href, onClick, icon, children, bordered }) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors
        ${bordered ? 'border-b border-neutral-100 dark:border-neutral-700' : ''}`}>
      {children}
    </Link>
  );
}

function AdminLink({ href, isActivePath, children }) {
  return (
    <Link href={href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
      ${isActivePath(href) || (href === '/admin/debug' && isActivePath('/admin/debug'))
        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
      {children}
    </Link>
  );
}
