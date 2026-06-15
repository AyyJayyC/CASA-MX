import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useAuth } from "@/hooks/useAuth"
import { useMyOffers, useMyRequests, useMyApplications, useMyProperties, useNotifications } from "@/lib/queries"
import { formatPrice } from "@/lib/format"
import Link from "next/link"
import type { OffersResponse } from "@/types/property"
import type { CRMBoardProperty } from "@/types/crm"

export const getServerSideProps = withAuth()

// ─── SVG Icons ──────────────────────────────────────────────

const FileTextIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>)
const SendIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>)
const ClipboardListIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="10" y1="14" x2="14" y2="14"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="18" x2="18" y2="18"/></svg>)
const PlusCircleIcon = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>)
const HomeIcon = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
const SettingsIcon = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>)
const EyeIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
const MessageSquareIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>)
const HeartIcon = (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>)
const BellIcon = (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>)
const ArrowRightIcon = (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>)

// ─── Priority Card ─────────────────────────────────────────

interface PriorityCardProps {
  icon: JSX.Element
  count: number
  label: string
  subtitle: string
  href: string
  show: boolean
}

function PriorityCard({ icon, count, label, subtitle, href, show }: PriorityCardProps) {
  if (!show) return null
  return (
    <Link href={href} className="group bg-white border border-sand-dark/20 rounded-2xl p-5 hover:border-clay/40 hover:shadow-lg transition-all flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-clay/10 flex items-center justify-center text-clay flex-shrink-0 group-hover:bg-clay group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold text-ink leading-none">{count}</p>
        <p className="text-sm font-semibold text-ink mt-1">{label}</p>
        <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
      </div>
    </Link>
  )
}

// ─── Metric Card ────────────────────────────────────────────

interface MetricCardProps {
  icon: JSX.Element
  value: number | string
  label: string
  subtitle?: string
}

function MetricCard({ icon, value, label, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white border border-sand-dark/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-clay/60">{icon}</div>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
  icon?: JSX.Element
  message: string
  action?: string
  href?: string
}

function EmptyState({ icon, message, action, href }: EmptyStateProps) {
  return (
    <div className="text-center py-10 bg-sand-light/30 rounded-xl border border-dashed border-sand-dark/30">
      {icon && <div className="text-clay/30 mb-3 flex justify-center">{icon}</div>}
      <p className="text-sm text-ink-muted max-w-md mx-auto">{message}</p>
      {action && href && (
        <Link href={href} className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-clay text-white text-sm font-medium rounded-lg hover:bg-clay-dark transition-colors">
          {action}
          {ArrowRightIcon}
        </Link>
      )}
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: offersData } = useMyOffers()
  const { data: requestsData } = useMyRequests()
  const { data: appsData } = useMyApplications()
  const { data: propsData } = useMyProperties()
  const { data: notifData } = useNotifications()

  const offers = (offersData as OffersResponse)?.offers ?? []
  const requests = (requestsData as { requests?: unknown[] })?.requests ?? []
  const applications = (appsData as { applications?: unknown[] })?.applications ?? []
  const properties = (propsData as { data?: CRMBoardProperty[] })?.data ?? []
  const notifications = (notifData as { notifications?: Array<{ id: string; message: string; type: string; createdAt: string }> })?.notifications ?? []

  const pendingOffers = offers.filter((o) => o.status === "pending").length
  const totalOffers = offers.length
  const totalRequests = requests.length
  const totalApplications = applications.length
  const activeProperties = properties.length
  const consultas = totalOffers + totalRequests

  const role = user?.activeRole
  const isOwner = role === "owner" || role === "realtor" || role === "admin"
  const isRealtor = role === "realtor"
  const isSeeker = role === "seeker"
  const showRequests = isOwner || isSeeker
  const showOffers = isOwner || isSeeker
  const showApps = isRealtor || isSeeker

  const activityItems: Array<{ id: string; message: string; date: string }> = (() => {
    if (notifications.length > 0) {
      return notifications.slice(0, 10).map((n) => ({ id: n.id, message: n.message, date: n.createdAt }))
    }
    return offers.slice(0, 5).map((o) => ({
      id: o.id,
      message: `${o.buyerName ?? "Oferta"} en ${o.property?.title ?? "propiedad"} — ${formatPrice(o.offerAmount)}`,
      date: o.createdAt,
    }))
  })()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Welcome ──────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Bienvenido de nuevo, {user?.name?.split(" ")[0] ?? "Usuario"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Administra tus propiedades, ofertas, solicitudes y más desde este panel.
          </p>
        </div>

        {/* ── Priority Actions ─────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Requiere tu atención
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PriorityCard
              icon={FileTextIcon}
              count={totalRequests}
              label="Solicitudes"
              subtitle={totalRequests > 0 ? `${totalRequests} pendientes` : "Sin solicitudes nuevas"}
              href="/dashboard/requests"
              show={showRequests}
            />
            <PriorityCard
              icon={SendIcon}
              count={totalOffers}
              label="Ofertas"
              subtitle={pendingOffers > 0 ? `${pendingOffers} pendientes de revisar` : totalOffers > 0 ? `${totalOffers} activas` : "Sin ofertas activas"}
              href="/dashboard/offers"
              show={showOffers}
            />
            <PriorityCard
              icon={ClipboardListIcon}
              count={totalApplications}
              label="Aplicaciones"
              subtitle={totalApplications > 0 ? `${totalApplications} por revisar` : "Sin aplicaciones nuevas"}
              href="/dashboard/apps"
              show={showApps}
            />
          </div>
        </div>

        {/* ── Property Performance ─────────────────── */}
        {isOwner && (
          <div>
            <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
              Rendimiento de tus propiedades
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={HomeIcon} value={activeProperties} label="Propiedades activas" />
              <MetricCard icon={HeartIcon} value="—" label="Guardados" subtitle="Próximamente" />
              <MetricCard icon={EyeIcon} value="—" label="Vistas totales" subtitle="Próximamente" />
              <MetricCard icon={MessageSquareIcon} value={consultas} label="Consultas recibidas" />
            </div>
          </div>
        )}

        {/* ── Properties Overview ──────────────────── */}
        {isOwner && properties.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide">
                Tus propiedades
              </h2>
              <Link href="/dashboard/properties" className="text-xs text-clay hover:text-clay-dark flex items-center gap-1">
                Ver todas {ArrowRightIcon}
              </Link>
            </div>
            <div className="space-y-2">
              {properties.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="flex items-center gap-3 bg-white border border-sand-dark/20 rounded-xl px-4 py-3 hover:border-clay/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-sand-light flex-shrink-0 flex items-center justify-center text-ink-muted">
                    {HomeIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{p.title}</p>
                    <p className="text-xs text-ink-muted">
                      {p.listingType === "for_sale" ? "En venta" : "En renta"}
                      {p.status && <> &middot; <span className="capitalize">{p.status}</span></>}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-ink-muted flex-shrink-0">
                    <span>0 vistas</span>
                    <span>0 ofertas</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isOwner && properties.length === 0 && (
          <EmptyState
            icon={HomeIcon}
            message="Aún no tienes propiedades publicadas. Publica tu primera propiedad para comenzar a recibir solicitudes y ofertas."
            action="Publicar propiedad"
            href="/publish"
          />
        )}

        {isSeeker && (
          <EmptyState
            message="Explora propiedades disponibles y envía solicitudes para comenzar. Tu actividad aparecerá aquí."
            action="Buscar propiedades"
            href="/properties"
          />
        )}

        {/* ── Recent Activity ──────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Actividad reciente
          </h2>
          <div className="bg-white border border-sand-dark/20 rounded-xl">
            {activityItems.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="text-clay/20 mb-3 flex justify-center">{BellIcon}</div>
                <p className="text-sm text-ink-muted">
                  Tu actividad aparecerá aquí cuando tengas interacciones con propiedades.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-sand-dark/10">
                {activityItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-clay flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">{item.message}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {new Date(item.date).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isOwner && (
              <Link href="/publish" className="flex items-center gap-3 bg-white border border-sand-dark/20 rounded-xl px-4 py-3 hover:border-clay/30 transition-colors">
                <div className="text-clay">{PlusCircleIcon}</div>
                <span className="text-sm font-medium text-ink">Publicar propiedad</span>
              </Link>
            )}
            {isOwner && (
              <Link href="/dashboard/properties" className="flex items-center gap-3 bg-white border border-sand-dark/20 rounded-xl px-4 py-3 hover:border-clay/30 transition-colors">
                <div className="text-clay">{HomeIcon}</div>
                <span className="text-sm font-medium text-ink">Mis propiedades</span>
              </Link>
            )}
            <Link href="/settings" className="flex items-center gap-3 bg-white border border-sand-dark/20 rounded-xl px-4 py-3 hover:border-clay/30 transition-colors">
              <div className="text-clay">{SettingsIcon}</div>
              <span className="text-sm font-medium text-ink">Ajustes</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
