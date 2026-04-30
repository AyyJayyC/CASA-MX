'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';

const SECTIONS = [
  {
    href: '/dashboard/applications',
    title: 'Solicitudes de renta',
    description: 'Revisa y gestiona las solicitudes de inquilinos para tus propiedades en renta.',
    icon: '📋',
    roles: ['landlord'],
  },
  {
    href: '/dashboard/offers',
    title: 'Ofertas de compra',
    description: 'Revisa y responde las ofertas que has recibido en tus propiedades en venta.',
    icon: '🤝',
    roles: ['seller', 'wholesaler', 'admin'],
  },
  {
    href: '/dashboard/my-offers',
    title: 'Mis negociaciones de compra',
    description: 'Sigue el árbol de negociación y responde contraofertas de vendedores.',
    icon: '🧭',
    roles: ['buyer', 'admin'],
  },
  {
    href: '/dashboard/rental-applications',
    title: 'Mis solicitudes de renta',
    description: 'Consulta el estado de tus solicitudes como inquilino.',
    icon: '🏠',
    roles: ['tenant'],
  },
  {
    href: '/publish-property',
    title: 'Publicar propiedad',
    description: 'Crea un nuevo listado de propiedad en venta o en renta.',
    icon: '➕',
    roles: ['seller', 'wholesaler', 'landlord', 'admin'],
  },
  {
    href: '/properties',
    title: 'Buscar propiedades',
    description: 'Explora propiedades disponibles para comprar o rentar.',
    icon: '🔍',
    roles: ['buyer', 'tenant', 'seller', 'wholesaler', 'landlord', 'admin'],
  },
  {
    href: '/requested',
    title: 'Mis solicitudes de información',
    description: 'Consulta las propiedades sobre las que has pedido información.',
    icon: '📩',
    roles: ['buyer'],
  },
  {
    href: '/reviews',
    title: 'Reseñas',
    description: 'Consulta y gestiona tus reseñas de propiedades.',
    icon: '⭐',
    roles: ['tenant', 'landlord'],
  },
  {
    href: '/dashboard/account',
    title: 'Mi cuenta',
    description: 'Gestiona tus documentos de identidad (INE/IFE) y datos personales.',
    icon: '🪪',
    roles: ['buyer', 'tenant', 'seller', 'wholesaler', 'landlord', 'admin'],
  },
];

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">Debes iniciar sesión para ver el inicio.</p>
          <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const approvedRoles = (user?.roles ?? [])
    .filter((r) => r.status === 'approved')
    .map((r) => r.type);

  const visibleSections = SECTIONS.filter((s) =>
    s.roles.some((r) => approvedRoles.includes(r))
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Bienvenido, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            ¿Qué quieres hacer hoy?
          </p>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="
                group block p-6
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                hover:border-amber-400 dark:hover:border-amber-500
                rounded-xl shadow-sm
                transition-all hover:shadow-md
              "
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{section.icon}</span>
                <div className="space-y-1 min-w-0">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {visibleSections.length === 0 && (
          <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-medium">Tu cuenta está pendiente de aprobación.</p>
            <p className="text-sm mt-1">Un administrador revisará tu solicitud pronto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
