'use client';
import React, { useState, useEffect } from 'react';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
  ResponsiveContainer, Area, AreaChart, Legend,
} from 'recharts';
import { formatNumber, formatCurrency, formatDate, formatDateTime, formatPercentage, formatRelativeTime } from '@/lib/utils/format';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

async function authFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

function Trend({ value, positive = true }) {
  if (value == null) return null;
  const isPositive = positive ? value >= 0 : value <= 0;
  return (
    <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {value > 0 ? '+' : ''}{formatNumber(value)}
    </span>
  );
}

function KpiCard({ title, value, trend, trendLabel, positive = true }) {
  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(value)}</p>
      {trend != null && (
        <div className="flex items-center gap-1.5">
          <Trend value={trend} positive={positive} />
          <span className="text-xs text-neutral-400 dark:text-neutral-500">{trendLabel || 'vs. semana pasada'}</span>
        </div>
      )}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="p-10 text-center text-neutral-400 dark:text-neutral-600">
      <p className="text-lg">⚠️</p>
      <p className="text-sm mt-2">{message || 'No se pudieron cargar los datos.'}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [topProperties, setTopProperties] = useState([]);
  const [referralSummary, setReferralSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      authFetch(`${BACKEND_URL}/admin/analytics/dashboard`),
      authFetch(`${BACKEND_URL}/admin/analytics/timeline?days=${days}`),
      authFetch(`${BACKEND_URL}/admin/analytics/top-properties?limit=10`),
      authFetch(`${BACKEND_URL}/admin/analytics/referral-summary`),
      authFetch(`${BACKEND_URL}/admin/analytics/events?limit=50`),
    ]).then(([d, t, tp, rs, ev]) => {
      if (!mounted) return;
      setDashboard(d);
      setTimeline(t);
      setTopProperties(tp || []);
      setReferralSummary(rs);
      setEvents(ev || []);
      if (!d) setError('No se pudieron cargar los datos. Verifica la conexión con el backend.');
    }).catch(() => {
      if (mounted) setError('Error al cargar el dashboard.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [days]);

  const timelineData = timeline?.dates?.map((date, i) => ({
    date: date.slice(5),
    Usuarios: timeline.users[i],
    Propiedades: timeline.properties[i],
    Solicitudes: timeline.contactRequests[i],
    'Ref. clics': timeline.referralClicks[i],
    'Ref. registros': timeline.referralSignups[i],
    Ingresos: timeline.creditRevenue[i],
  })) || [];

  const usersByRoleData = dashboard?.usersByRole
    ? Object.entries(dashboard.usersByRole).map(([name, value]) => ({ name, value }))
    : [];

  const propertiesByStatusData = dashboard?.properties?.byStatus
    ? Object.entries(dashboard.properties.byStatus).map(([status, count]) => ({ status: status === 'available' ? 'Disponible' : status === 'sold' ? 'Vendido' : status === 'rented' ? 'Rentado' : status === 'pending' ? 'Pendiente' : status, count }))
    : [];

  const referralFunnelData = referralSummary ? [
    { name: 'Clics', value: referralSummary.totalClicks, pct: 100 },
    { name: 'Registros', value: referralSummary.totalSignups, pct: referralSummary.conversionRate },
  ] : [];

  return (
    <RequireRole roles={['admin']}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard de Análisis</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Métricas clave de la plataforma</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full" />
          </div>
        )}

        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard
                title="Usuarios totales"
                value={dashboard?.users?.total || 0}
                trend={dashboard?.users?.newThisWeek}
                trendLabel="nuevos esta semana"
              />
              <KpiCard
                title="Propiedades"
                value={dashboard?.properties?.total || 0}
                trend={dashboard?.properties?.newThisWeek}
                trendLabel="nuevas esta semana"
              />
              <KpiCard
                title="Créditos comprados"
                value={dashboard?.revenue?.totalCreditsPurchased || 0}
              />
              <KpiCard
                title="Clics en referidos"
                value={dashboard?.referrals?.clicks || 0}
                trend={referralSummary?.conversionRate}
                trendLabel="tasa conv."
                positive={referralSummary?.conversionRate > 0}
              />
              <KpiCard
                title="Registros por ref."
                value={dashboard?.referrals?.signups || 0}
              />
            </div>

            {/* Timeline Chart */}
            <Section title="Crecimiento diario">
              {timelineData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="Usuarios" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Propiedades" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Solicitudes" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">Sin datos suficientes.</p>
              )}
            </Section>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Usuarios por rol">
                {usersByRoleData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={usersByRoleData} dataKey="value" nameKey="name" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                          {usersByRoleData.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-8">Sin datos.</p>
                )}
              </Section>

              <Section title="Propiedades por estado">
                {propertiesByStatusData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propertiesByStatusData}>
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#888" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#888" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-8">Sin datos.</p>
                )}
              </Section>
            </div>

            {/* Revenue Trend */}
            <Section title="Ingresos por créditos">
              {timelineData.some((d) => d.Ingresos > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Ingresos" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-8">Sin datos de ingresos aún.</p>
              )}
            </Section>

            {/* Referral Funnel */}
            <Section title="Embudo de referidos">
              {referralFunnelData.length > 0 && referralSummary.totalClicks > 0 ? (
                <div className="space-y-4">
                  {referralFunnelData.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.name}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">{formatNumber(item.value)} ({item.pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 transition-all"
                          style={{ width: `${Math.min(item.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-6">Sin actividad de referidos aún.</p>
              )}
            </Section>

            {/* Top Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Propiedades más vistas">
                {topProperties.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                          <th className="pb-2 font-medium">Propiedad</th>
                          <th className="pb-2 font-medium text-right">Vistas</th>
                          <th className="pb-2 font-medium text-right">Solicitudes</th>
                          <th className="pb-2 font-medium text-right">Ofertas</th>
                          <th className="pb-2 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProperties.map((p) => (
                          <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                            <td className="py-2.5 pr-4">
                              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-40">{p.title}</p>
                              <p className="text-xs text-neutral-400">{p.listingType === 'for_rent' ? `$${formatNumber(p.monthlyRent)}/mes` : `$${formatNumber(p.price)}`}</p>
                            </td>
                            <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{formatNumber(p.views)}</td>
                            <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{formatNumber(p.contactRequests)}</td>
                            <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{formatNumber(p.offers)}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-6">Sin propiedades aún.</p>
                )}
              </Section>

              <Section title="Top referidores">
                {referralSummary?.topReferrers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                          <th className="pb-2 font-medium">Código</th>
                          <th className="pb-2 font-medium text-right">Clics</th>
                          <th className="pb-2 font-medium text-right">Registros</th>
                          <th className="pb-2 font-medium text-right">Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referralSummary.topReferrers.map((r, i) => (
                          <tr key={r.referralCode} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                            <td className="py-2.5 pr-4">
                              <code className="text-sm font-mono text-amber-700 dark:text-amber-400">{r.referralCode}</code>
                            </td>
                            <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{formatNumber(r.clicks)}</td>
                            <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{formatNumber(r.signups)}</td>
                            <td className="py-2.5 text-right">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {r.clicks > 0 ? formatPercentage((r.signups / r.clicks) * 100) : '0%'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-6">Sin actividad de referidos.</p>
                )}
              </Section>
            </div>

            {/* Recent Activity */}
            <Section title="Actividad reciente">
              {events.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                        <th className="pb-2 font-medium">Evento</th>
                        <th className="pb-2 font-medium">Usuario</th>
                        <th className="pb-2 font-medium hidden sm:table-cell">Entidad</th>
                        <th className="pb-2 font-medium text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 25).map((e, i) => (
                        <tr key={e.id || i} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                          <td className="py-2 pr-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                              {e.eventName}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                            {e.userId ? `${e.userId.slice(0, 8)}...` : '—'}
                          </td>
                          <td className="py-2 pr-4 text-neutral-500 dark:text-neutral-400 text-xs hidden sm:table-cell font-mono">
                            {e.entityId ? `${e.entityId.slice(0, 12)}...` : '—'}
                          </td>
                          <td className="py-2 text-right text-xs text-neutral-400" title={e.createdAt}>
                            {formatRelativeTime(e.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-6">Sin actividad reciente.</p>
              )}
            </Section>
          </>
        )}
      </div>
    </RequireRole>
  );
}
