"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { useCredits } from '@/lib/auth/CreditsContext';
import { getNotifications, markAllNotificationsRead } from '@/lib/api/notifications';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, switchRole, loading } = useAuth();
  const { balance } = useCredits();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const [notifData, setNotifData] = useState({ notifications: [], unreadCount: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const isAdminUser = Boolean(
    user?.roles?.some((r) => r.type === 'admin' && r.status === 'approved')
  );
  const isBuyerOrTenant = Boolean(
    user?.roles?.some((r) => ['buyer', 'tenant'].includes(r.type) && r.status === 'approved')
  );
  const canPublish = Boolean(
    user?.roles?.some((r) => ['seller', 'wholesaler', 'admin'].includes(r.type) && r.status === 'approved')
  );
  const showDebugUI = process.env.NODE_ENV !== 'production' && isAdminUser;

  useEffect(() => {
    setMounted(true);
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (propertiesDropdownOpen && !e.target.closest('.properties-dropdown')) {
        setPropertiesDropdownOpen(false);
      }
      if (notifOpen && !e.target.closest('.notif-dropdown')) {
        setNotifOpen(false);
      }
    };
    
    if (propertiesDropdownOpen || notifOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [propertiesDropdownOpen, notifOpen]);

  // Poll notifications every 30s
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotifData(data);
      } catch (e) { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActivePath = (path) => pathname === path;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              CasaMX
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="container max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent hover:from-amber-500 hover:to-yellow-700 transition-all"
          >
            CasaMX
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Propiedades Dropdown */}
            <div className="relative group properties-dropdown">
              <button
                onClick={() => setPropertiesDropdownOpen(!propertiesDropdownOpen)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  flex items-center gap-2
                  ${isActivePath('/properties') || propertiesDropdownOpen
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                Propiedades
                <svg className={`w-4 h-4 transition-transform ${propertiesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`
                absolute left-0 mt-0 w-48 
                bg-white dark:bg-neutral-800 
                border border-neutral-200 dark:border-neutral-700 
                rounded-lg shadow-lg 
                transition-all duration-200
                ${propertiesDropdownOpen 
                  ? 'opacity-100 visible' 
                  : 'opacity-0 invisible'
                }
                z-50
              `}>
                {/* Buyer/tenant: show buy + rent */}
                {isBuyerOrTenant ? (
                  <>
                    <Link
                      href="/properties?type=for_sale"
                      onClick={() => setPropertiesDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 border-b border-neutral-100 dark:border-neutral-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Comprar Propiedad
                    </Link>
                    <Link
                      href="/properties?type=for_rent"
                      onClick={() => setPropertiesDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Rentar Propiedad
                    </Link>
                  </>
                ) : (
                  <>
                <Link
                  href="/properties?type=for_sale"
                  onClick={() => setPropertiesDropdownOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-3
                    text-sm font-medium
                    text-neutral-700 dark:text-neutral-300
                    hover:bg-amber-50 dark:hover:bg-amber-900/20
                    hover:text-amber-600 dark:hover:text-amber-400
                    border-b border-neutral-100 dark:border-neutral-700
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vender Propiedad
                </Link>

                <Link
                  href="/properties?type=for_rent"
                  onClick={() => setPropertiesDropdownOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-3
                    text-sm font-medium
                    text-neutral-700 dark:text-neutral-300
                    hover:bg-amber-50 dark:hover:bg-amber-900/20
                    hover:text-amber-600 dark:hover:text-amber-400
                    border-b border-neutral-100 dark:border-neutral-700
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Rentar Propiedad
                </Link>

                <Link
                  href="/properties"
                  onClick={() => setPropertiesDropdownOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-3
                    text-sm font-medium
                    text-neutral-700 dark:text-neutral-300
                    hover:bg-amber-50 dark:hover:bg-amber-900/20
                    hover:text-amber-600 dark:hover:text-amber-400
                    border-b border-neutral-100 dark:border-neutral-700
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar Propiedades
                </Link>

                {isAuthenticated && user?.roles.some((r) => ['seller', 'wholesaler', 'admin'].includes(r.type) && r.status === 'approved') && (
                  <Link
                    href="/publish-property"
                    onClick={() => setPropertiesDropdownOpen(false)}
                    className="
                      flex items-center gap-3 px-4 py-3
                      text-sm font-medium
                      text-neutral-700 dark:text-neutral-300
                      hover:bg-amber-50 dark:hover:bg-amber-900/20
                      hover:text-amber-600 dark:hover:text-amber-400
                      transition-colors
                    "
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar Nueva Propiedad
                  </Link>
                )}
                  </>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname?.startsWith('/dashboard')
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && isAdminUser && (
              <>
                <Link
                  href="/admin/approvals"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActivePath('/admin/approvals')
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }
                  `}
                >
                  Admin
                </Link>
                {showDebugUI && (
                  <Link
                    href="/admin/debug"
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActivePath('/admin/debug') || pathname?.startsWith('/admin/debug/')
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }
                    `}
                  >
                    Debug
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? (
                // Sun icon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Desktop Auth Section */}
            {!loading && (
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated && user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      {/* Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name[0].toUpperCase()}
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">{user.activeRole || 'Sin rol'}</p>
                      </div>

                      {/* Role Switcher */}
                      {user.roles && user.roles.length > 1 && (
                        <select
                          value={user.activeRole || ''}
                          onChange={(e) => switchRole(e.target.value)}
                          className="
                            text-xs px-2 py-1
                            bg-white dark:bg-neutral-900
                            border border-neutral-300 dark:border-neutral-700
                            rounded-md
                            text-neutral-700 dark:text-neutral-300
                            focus:outline-none focus:ring-2 focus:ring-amber-400
                          "
                        >
                          {user.roles.map((role) => (
                            <option
                              key={role.type}
                              value={role.type}
                              disabled={role.status !== 'approved'}
                            >
                              {role.type} {role.status !== 'approved' ? `(${role.status})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Notification Bell */}
                    <div className="relative notif-dropdown">
                      <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label="Notificaciones"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {notifData.unreadCount > 0 && (
                          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">
                            {notifData.unreadCount > 9 ? '9+' : notifData.unreadCount}
                          </span>
                        )}
                      </button>
                      {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Notificaciones</span>
                            {notifData.unreadCount > 0 && (
                              <button
                                onClick={async () => {
                                  await markAllNotificationsRead();
                                  setNotifData(d => ({ ...d, unreadCount: 0, notifications: d.notifications.map(n => ({ ...n, read: true })) }));
                                }}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                Marcar todas leídas
                              </button>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {notifData.notifications.length === 0 ? (
                              <p className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400 text-center">Sin notificaciones</p>
                            ) : (
                              notifData.notifications.slice(0, 5).map(n => (
                                <div key={n.id} className={`px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0 ${!n.read ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{n.title}</p>
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-700">
                            <Link
                              href="/dashboard/notifications"
                              onClick={() => setNotifOpen(false)}
                              className="block text-center text-xs text-amber-600 dark:text-amber-400 hover:underline py-1"
                            >
                              Ver todas las notificaciones
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Settings link */}
                    <Link
                      href="/settings"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Ajustes de perfil"
                    >
                      ⚙️ Ajustes
                    </Link>

                    {/* Logout Button */}
                    <Link
                      href="/credits"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      title="Mis créditos"
                    >
                      💰 {balance}
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="
                        px-4 py-2 text-sm font-medium
                        text-neutral-700 dark:text-neutral-300
                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                        rounded-lg
                        transition-colors
                      "
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="
                        px-4 py-2 text-sm font-medium
                        text-neutral-700 dark:text-neutral-300
                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                        rounded-lg
                        transition-colors
                      "
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      className="
                        px-4 py-2 text-sm font-semibold
                        bg-gradient-to-br from-amber-400 to-yellow-600
                        hover:from-amber-500 hover:to-yellow-700
                        text-white
                        rounded-lg
                        transition-all
                      "
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4 space-y-2">
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className={`
                block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActivePath('/properties')
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }
              `}
            >
              Propiedades
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname?.startsWith('/dashboard')
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && isAdminUser && (
              <>
                <Link
                  href="/admin/approvals"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActivePath('/admin/approvals')
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }
                  `}
                >
                  Admin
                </Link>
                {showDebugUI && (
                  <Link
                    href="/admin/debug"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActivePath('/admin/debug') || pathname?.startsWith('/admin/debug/')
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }
                    `}
                  >
                    Debug
                  </Link>
                )}
              </>
            )}

            {!loading && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{user.name}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{user.activeRole || 'Sin rol activo'}</p>
                      
                      {user.roles && user.roles.length > 1 && (
                        <select
                          value={user.activeRole || ''}
                          onChange={(e) => switchRole(e.target.value)}
                          className="
                            mt-2 w-full
                            text-xs px-2 py-1.5
                            bg-white dark:bg-neutral-900
                            border border-neutral-300 dark:border-neutral-700
                            rounded-md
                            text-neutral-700 dark:text-neutral-300
                          "
                        >
                          {user.roles.map((role) => (
                            <option
                              key={role.type}
                              value={role.type}
                              disabled={role.status !== 'approved'}
                            >
                              {role.type} {role.status !== 'approved' ? `(${role.status})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="
                        w-full px-4 py-2 text-sm font-medium
                        text-neutral-700 dark:text-neutral-300
                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                        rounded-lg
                        transition-colors
                        text-left
                      "
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        block px-4 py-2 text-sm font-medium
                        text-neutral-700 dark:text-neutral-300
                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                        rounded-lg
                        transition-colors
                      "
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="
                        block px-4 py-2 text-sm font-semibold text-center
                        bg-gradient-to-br from-amber-400 to-yellow-600
                        text-white
                        rounded-lg
                        transition-all
                      "
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
