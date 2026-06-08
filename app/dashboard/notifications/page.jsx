"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";

const TYPE_LABELS = {
  offer_accepted: "Oferta Aceptada",
  offer_rejected: "Oferta Rechazada",
  offer_countered: "Contraoferta",
  offer_received: "Nueva Oferta",
  application_approved: "Solicitud Aprobada",
  application_rejected: "Solicitud Rechazada",
  application_received: "Nueva Solicitud",
  new_property_in_area: "Propiedad en tu área",
};

const TYPE_COLORS = {
  offer_accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  offer_rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  offer_countered:
    "bg-clay-100 text-clay-800 dark:bg-clay-900/30 dark:text-clay-400",
  offer_received:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  application_approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  application_rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  application_received:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  new_property_in_area:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function NotificationsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getNotifications()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setFetchError("No se pudieron cargar las notificaciones.");
      })
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setData((d) => ({
      ...d,
      unreadCount: Math.max(
        0,
        d.unreadCount -
          (d.notifications.find((n) => n.id === id && !n.read) ? 1 : 0),
      ),
      notifications: d.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setData((d) => ({
      ...d,
      unreadCount: 0,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  if (loading || fetching) {
    return (
      <div className="container max-w-3xl py-12">
        <p className="text-neutral-500 dark:text-neutral-400">Cargando...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container max-w-3xl py-12">
        <div className="text-center py-16 bg-red-50 dark:bg-red-900/10 rounded-xl">
          <p className="text-red-600 dark:text-red-400">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Notificaciones
          {data.unreadCount > 0 && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {data.unreadCount} nuevas
            </span>
          )}
        </h1>
        {data.unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-clay-600 dark:text-clay-400 hover:underline font-medium"
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      {data.notifications.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sin notificaciones aún
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors ${
                !n.read
                  ? "bg-clay-50 dark:bg-clay-900/10 border-clay-200 dark:border-clay-800"
                  : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[n.type] || "bg-neutral-100 text-neutral-700"}`}
                    >
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                    {!n.read && (
                      <span
                        className="w-2 h-2 bg-clay-500 rounded-full inline-block"
                        title="No leída"
                      />
                    )}
                  </div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                    {n.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {new Date(n.createdAt).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-xs text-clay-600 dark:text-clay-400 hover:underline shrink-0"
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
