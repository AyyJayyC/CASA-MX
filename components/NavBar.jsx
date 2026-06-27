"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useCreditsBalance } from "@/lib/queries/credits";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { getRoleLabel } from "@/lib/reviews";
import VerificationBadges from "@/components/VerificationBadges";
import DesktopNavLinks from "./DesktopNavLinks.jsx";
import MobileMenu from "./MobileMenu.jsx";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { data: balance = 0 } = useCreditsBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [notifData, setNotifData] = useState({
    notifications: [],
    unreadCount: 0,
  });
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdminUser = Boolean(
    user?.activeRole === "admin" &&
    user?.roles?.some((r) => r.type === "admin" && r.status === "approved"),
  );
  const isBuyer = Boolean(
    user?.activeRole === "buyer" &&
    user?.roles?.some(
      (r) => r.type === "buyer" && r.status === "approved",
    ),
  );
  const isTenant = Boolean(
    user?.activeRole === "tenant" &&
    user?.roles?.some(
      (r) => r.type === "tenant" && r.status === "approved",
    ),
  );
  const canPublish = Boolean(
    ["seller", "wholesaler", "admin", "landlord"].includes(user?.activeRole) &&
    user?.roles?.some(
      (r) =>
        ["seller", "wholesaler", "admin", "landlord"].includes(r.type) &&
        r.status === "approved",
    ),
  );
  const showDebugUI = process.env.NODE_ENV !== "production" && isAdminUser;
  const showAuthenticated = !loading && isAuthenticated && user;

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (propertiesDropdownOpen && !e.target.closest(".properties-dropdown"))
        setPropertiesDropdownOpen(false);
      if (notifOpen && !e.target.closest(".notif-dropdown"))
        setNotifOpen(false);
    };
    if (propertiesDropdownOpen || notifOpen)
      document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [propertiesDropdownOpen, notifOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifData(data);
      } catch {
        /* silent */
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  function toggleDarkMode() {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    newDarkMode
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
  }

  async function handleLogout() {
    try {
      await logout();
      setMobileMenuOpen(false);
      router.push("/");
    } catch {
      /* silent */
    }
  }

  function isActivePath(path) {
    return pathname === path;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="container max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="Inicio Casa-MX.com"
          >
            <Image
              src="/brand/logo-light.png"
              alt="CASA MX"
              width={176}
              height={44}
              className="block dark:hidden"
            />
            <Image
              src="/brand/logo-dark.png"
              alt="CASA MX"
              width={176}
              height={44}
              className="hidden dark:block"
            />
          </Link>

          <DesktopNavLinks
            isAuthenticated={isAuthenticated}
            isAdminUser={isAdminUser}
            showDebugUI={showDebugUI}
            activeRole={user?.activeRole}
            canPublish={canPublish}
            propertiesDropdownOpen={propertiesDropdownOpen}
            setPropertiesDropdownOpen={setPropertiesDropdownOpen}
            isActivePath={isActivePath}
            pathname={pathname}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={
                darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {showAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={`Avatar de ${user.name}`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-clay rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {getRoleLabel(user.activeRole) || "Sin rol"}
                      </p>
                      <VerificationBadges
                        compact
                        identityVerified={Boolean(user.officialIdVerified)}
                        identityUploaded={Boolean(user.officialIdUploaded)}
                        paidSubscriber={Boolean(user.paidSubscriber)}
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="relative notif-dropdown">
                    <button
                      onClick={() => setNotifOpen(!notifOpen)}
                      className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      aria-label="Notificaciones"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {notifData.unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">
                          {notifData.unreadCount > 9
                            ? "9+"
                            : notifData.unreadCount}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            Notificaciones
                          </span>
                          {notifData.unreadCount > 0 && (
                            <button
                              onClick={async () => {
                                await markAllNotificationsRead();
                                setNotifData((d) => ({
                                  ...d,
                                  unreadCount: 0,
                                  notifications: d.notifications.map((n) => ({
                                    ...n,
                                    read: true,
                                  })),
                                }));
                              }}
                              className="text-xs text-clay dark:text-clay-400 hover:underline"
                            >
                              Marcar todas leídas
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifData.notifications.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                              Sin notificaciones
                            </p>
                          ) : (
                            notifData.notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                className={`px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0 ${!n.read ? "bg-clay/50 dark:bg-clay-900/10" : ""}`}
                              >
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {n.title}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                  {n.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-700">
                          <Link
                            href="/dashboard/notifications"
                            onClick={() => setNotifOpen(false)}
                            className="block text-center text-xs text-clay dark:text-clay-400 hover:underline py-1"
                          >
                            Ver todas las notificaciones
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Inicio
                  </Link>
                  {isAdminUser && (
                    <Link
                      href="/admin/approvals"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  {isBuyer ? (
                    <Link
                      href="/dashboard/my-offers"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Mis ofertas
                    </Link>
                  ) : null}
                  {isTenant ? (
                    <Link
                      href="/dashboard/rental-applications"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Mis solicitudes
                    </Link>
                  ) : null}
                  {!isBuyer && !isTenant && canPublish ? (
                    <Link
                      href="/dashboard/contact-requests"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Solicitudes
                    </Link>
                  ) : null}
                  <Link
                    href="/settings"
                    onClick={() => {
                      setNotifOpen(false);
                      setPropertiesDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Ajustes
                  </Link>

                  {!isBuyer && !isTenant && (
                    <Link
                      href="/credits"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-clay/10 dark:bg-clay-900/20 text-clay dark:text-clay hover:bg-clay/100 dark:hover:bg-clay/900/40 transition-colors"
                    >
                      💰 {balance}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold bg-clay hover:bg-clay-500 text-white rounded-lg transition-all"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          isAdminUser={isAdminUser}
          showDebugUI={showDebugUI}
          showAuthenticated={showAuthenticated}
          user={user}
          handleLogout={handleLogout}
          isActivePath={isActivePath}
          pathname={pathname}
          canPublish={canPublish}
          isBuyer={isBuyer}
          isTenant={isTenant}
        />
      </div>
    </header>
  );
}
