import { withAuth } from "@/lib/auth-gssp"
import { Layout } from "@/components/layout/Layout"
import { useNotifications } from "@/lib/queries"
import Link from "next/link"

export const getServerSideProps = withAuth()

interface NotifItem { id: string; type: string; title: string; message: string; read: boolean; createdAt: string }

export default function NotificationsPage() {
  const { data } = useNotifications()
  const notifs = (data as { notifications?: NotifItem[] })?.notifications ?? []

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">Notificaciones</h1>
        {notifs.length === 0 ? (
          <div className="bg-white border border-sand-dark/30 rounded-xl p-12 text-center">
            <p className="text-5xl mb-4">\uD83D\uDD14</p>
            <h2 className="text-xl font-semibold text-ink mb-1">Sin notificaciones</h2>
            <p className="text-ink-muted text-sm">Las notificaciones de ofertas, solicitudes y mensajes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n: NotifItem) => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.read ? "bg-white border-sand-dark/20" : "bg-clay/5 border-clay/20"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.read ? "bg-sand-dark" : "bg-clay"}`} />
                  <div>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-sm text-ink-light">{n.message}</p>
                    <p className="text-xs text-ink-muted mt-1">{new Date(n.createdAt).toLocaleString("es-MX")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/dashboard" className="block mt-4 text-sm text-clay hover:text-clay-dark">&larr; Panel</Link>
      </div>
    </Layout>
  )
}
