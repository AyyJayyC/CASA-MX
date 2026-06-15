import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useAuth } from "@/hooks/useAuth"
import { useMyOffers } from "@/lib/queries"
import { formatPrice } from "@/lib/format"
import Link from "next/link"
import type { OffersResponse } from "@/types/property"
import type { Role } from "@/types"

export const getServerSideProps = withAuth()

interface QuickCard { icon: JSX.Element; title: string; subtitle: string; href: string; roles: Role[] }

const PlusCircleIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>)
const HomeIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
const LayersIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>)
const FileTextIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>)
const SearchIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)
const SendIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>)
const DollarSignIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>)
const SettingsIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>)
const ClipboardListIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="10" y1="14" x2="14" y2="14"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="18" x2="18" y2="18"/></svg>)

const ALL_CARDS: QuickCard[] = [
  { icon: PlusCircleIcon, title: "Publicar", subtitle: "Agrega una nueva propiedad", href: "/publish", roles: ["owner", "realtor", "admin"] },
  { icon: HomeIcon,       title: "Mis propiedades", subtitle: "Administra tus publicaciones", href: "/dashboard/properties", roles: ["owner", "realtor", "admin"] },
  { icon: LayersIcon,     title: "CRM", subtitle: "Pipeline de clientes", href: "/dashboard/crm", roles: ["realtor"] },
  { icon: FileTextIcon,   title: "Solicitudes", subtitle: "Gestiona solicitudes recibidas", href: "/dashboard/requests", roles: ["owner", "realtor", "seeker"] },
  { icon: SearchIcon,     title: "Buscar", subtitle: "Explora propiedades", href: "/properties", roles: ["seeker"] },
  { icon: SendIcon,       title: "Ofertas", subtitle: "Ofertas enviadas y recibidas", href: "/dashboard/offers", roles: ["owner", "realtor", "seeker"] },
  { icon: DollarSignIcon, title: "Créditos", subtitle: "Tu saldo y paquetes", href: "/settings", roles: ["owner", "realtor", "seeker"] },
  { icon: SettingsIcon,   title: "Ajustes", subtitle: "Configura tu perfil", href: "/settings", roles: ["owner", "realtor", "admin", "seeker"] },
  { icon: ClipboardListIcon, title: "Aplicaciones", subtitle: "Tus aplicaciones de renta", href: "/dashboard/apps", roles: ["realtor", "seeker"] },
]

// TODO: Wire "Propiedades activas" to useMyProperties() count
// TODO: Wire "Solicitudes" to useMyRequests() count  
// TODO: "Guardados" requires a new /favorites API endpoint on backend
const STATS = [
  { label: "Propiedades activas", value: 0 },
  { label: "Ofertas", value: 0 },
  { label: "Solicitudes", value: 0 },
  { label: "Guardados", value: 0 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: offersData, isLoading: offersLoading, isError: offersError } = useMyOffers()
  const offers = (offersData as OffersResponse)?.offers ?? []
  const cards = user ? ALL_CARDS.filter(c => c.roles.includes(user.activeRole)) : []

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Panel</h1>

        {/* Quick-action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map(card => (
            <Link href={card.href} key={card.title} className="group bg-white border border-sand-dark/30 rounded-2xl p-6 hover:border-clay/40 hover:shadow-md transition-all text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-clay/10 flex items-center justify-center text-clay group-hover:bg-clay group-hover:text-white transition-colors">
                {card.icon}
              </div>
              <h3 className="font-semibold text-ink text-sm">{card.title}</h3>
              <p className="text-xs text-ink-muted mt-1">{card.subtitle}</p>
            </Link>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-white border border-sand-dark/30 rounded-xl p-4">
              <p className="text-2xl font-bold text-clay">{stat.label === "Ofertas" ? offers.length : 0}</p>
              <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white border border-sand-dark/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Actividad reciente</h2>
          {offersLoading ? (
            <div className="text-center py-8 text-ink-muted text-sm bg-sand-light/30 rounded-lg border border-dashed border-sand-dark/30">
              Cargando actividad...
            </div>
          ) : offersError ? (
            <div className="text-center py-8 text-red-600 text-sm bg-red-50 rounded-lg border border-dashed border-red-200">
              Error al cargar actividad. Intenta recargar la página.
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-ink-muted text-sm bg-sand-light/30 rounded-lg border border-dashed border-sand-dark/30">
              Tu actividad aparecerá aquí cuando tengas interacciones con propiedades.
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="flex gap-3 pb-4 border-b border-sand-dark/10 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-clay flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {offer.buyerName ?? "Oferta"} en {offer.property?.title ?? "propiedad"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatPrice(offer.offerAmount)} &middot; {offer.status === "pending" ? "Pendiente" : offer.status === "accepted" ? "Aceptada" : offer.status === "rejected" ? "Rechazada" : offer.status}
                      &middot; {new Date(offer.createdAt).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Link href="/dashboard/offers" className="text-sm text-ink-light hover:text-clay">Ofertas</Link>
          <Link href="/dashboard/requests" className="text-sm text-ink-light hover:text-clay">Solicitudes</Link>
          <Link href="/dashboard/apps" className="text-sm text-ink-light hover:text-clay">Aplicaciones</Link>
        </div>
      </div>
    </Layout>
  )
}
