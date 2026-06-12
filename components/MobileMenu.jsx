"use client";
import React from "react";
import Link from "next/link";
import VerificationBadges from "@/components/VerificationBadges";
import { getRoleLabel } from "@/lib/reviews";

export default function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated,
  isAdminUser,
  showDebugUI,
  showAuthenticated,
  user,
  handleLogout,
  isActivePath,
  pathname,
  canPublish,
  isBuyer,
  isTenant,
}) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4 space-y-2">
      <MobileLink
        href="/properties"
        onClick={onClose}
        isActive={isActivePath("/properties")}
      >
        Propiedades
      </MobileLink>

      {isAuthenticated && (
        <MobileLink
          href="/properties/map"
          onClick={onClose}
          isActive={isActivePath("/properties/map")}
        >
          Mapa
        </MobileLink>
      )}

      {isAuthenticated && (
        <MobileLink
          href="/dashboard"
          onClick={onClose}
          isActive={pathname?.startsWith("/dashboard")}
        >
          Inicio
        </MobileLink>
      )}

      {isBuyer && (
        <MobileLink
          href="/dashboard/my-offers"
          onClick={onClose}
          isActive={isActivePath("/dashboard/my-offers")}
        >
          Mis ofertas
        </MobileLink>
      )}

      {isTenant && (
        <MobileLink
          href="/dashboard/rental-applications"
          onClick={onClose}
          isActive={isActivePath("/dashboard/rental-applications")}
        >
          Mis solicitudes
        </MobileLink>
      )}

      {canPublish && (
        <>
          <MobileLink
            href="/publish-property"
            onClick={onClose}
            isActive={isActivePath("/publish-property")}
          >
            Vender
          </MobileLink>
          <MobileLink
            href="/credits"
            onClick={onClose}
            isActive={isActivePath("/credits")}
          >
            💲 Créditos
          </MobileLink>
        </>
      )}

      {isAuthenticated && isAdminUser && (
        <>
          <MobileLink
            href="/admin/approvals"
            onClick={onClose}
            isActive={isActivePath("/admin/approvals")}
          >
            Admin: Aprobaciones
          </MobileLink>
          <MobileLink
            href="/admin/analytics"
            onClick={onClose}
            isActive={isActivePath("/admin/analytics")}
          >
            Admin: Analítica
          </MobileLink>
          <MobileLink
            href="/admin/properties"
            onClick={onClose}
            isActive={isActivePath("/admin/properties")}
          >
            Admin: Propiedades
          </MobileLink>
          <MobileLink
            href="/admin/carousel"
            onClick={onClose}
            isActive={isActivePath("/admin/carousel")}
          >
            Admin: Carrusel
          </MobileLink>
          <MobileLink
            href="/admin/maps"
            onClick={onClose}
            isActive={isActivePath("/admin/maps")}
          >
            Admin: Mapas
          </MobileLink>
          <MobileLink
            href="/admin/agencies"
            onClick={onClose}
            isActive={isActivePath("/admin/agencies")}
          >
            Admin: Agencias
          </MobileLink>
          {showDebugUI && (
            <MobileLink
              href="/admin/debug"
              onClick={onClose}
              isActive={
                isActivePath("/admin/debug") ||
                pathname?.startsWith("/admin/debug/")
              }
            >
              Debug
            </MobileLink>
          )}
        </>
      )}

      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        {showAuthenticated ? (
          <>
            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`Avatar de ${user.name}`}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br bg-clay rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </p>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {getRoleLabel(user.activeRole) || "Sin rol activo"}
              </p>
              <div className="mt-2">
                <VerificationBadges
                  compact
                  identityVerified={Boolean(user.officialIdVerified)}
                  identityUploaded={Boolean(user.officialIdUploaded)}
                  paidSubscriber={Boolean(user.paidSubscriber)}
                />
              </div>
            </div>

            <MobileLink
              href="/settings"
              onClick={onClose}
              isActive={isActivePath("/settings")}
            >
              ⚙️ Ajustes
            </MobileLink>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <MobileLink href="/login" onClick={onClose} plain>
              Iniciar Sesión
            </MobileLink>
            <Link
              href="/register"
              onClick={onClose}
              className="block px-4 py-2 text-sm font-semibold text-center bg-gradient-to-br bg-clay text-white rounded-lg transition-all"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function MobileLink({ href, onClick, isActive, children, plain }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${
          isActive
            ? "bg-amber-50 dark:bg-amber-900/20 text-clay dark:text-clay-400"
            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
    >
      {children}
    </Link>
  );
}
