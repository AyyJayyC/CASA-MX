'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import Link from 'next/link';
import { getMyAgency, getMyAgencyMembership, getMyAgents, getAgencyPricing } from '@/lib/api/agencies';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const WHATSAPP = '+526624475213';

const PLAN_LABELS = { inactive: 'Inactivo', basico: 'Básico', pro: 'Pro', empresarial: 'Empresarial' };

export default function AgencyPage() {
  const { user, isAuthenticated } = useAuth();
  const [agency, setAgency] = useState(null);
  const [membership, setMembership] = useState(null);
  const [agentData, setAgentData] = useState({ agents: [], agentLimit: 0, total: 0 });
  const [pricing, setPricing] = useState(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ email: '', name: '', password: '' });
  const [addAgentError, setAddAgentError] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingAgent, setAddingAgent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddAgent = async () => {
    if (!newAgent.email || !newAgent.name || !newAgent.password) return;
    setAddingAgent(true);
    setAddAgentError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/agencies/me/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAgent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setAgentData(prev => ({ ...prev, agents: [data.data, ...(prev.agents || [])], total: (prev.total || 0) + 1 }));
      setNewAgent({ email: '', name: '', password: '' });
      setShowAddAgent(false);
    } catch (err) {
      setAddAgentError(err.message);
    }
    setAddingAgent(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      getMyAgency(), getMyAgencyMembership(), getMyAgents(), getAgencyPricing(),
    ]).then(([a, m, ad, pr]) => {
      setAgency(a);
      setMembership(m);
      setAgentData(ad || { agents: [], agentLimit: 0, total: 0 });
      setPricing(pr);
    }).catch((err) => {
      console.error('Failed to load agency data:', err);
      setError('No se pudo cargar la información de la agencia');
    }).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated]);

  const handleCopyInvite = () => {
    if (!agency?.referralCode) return;
    navigator.clipboard.writeText(`${FRONTEND_URL}/register?agencia=${agency.referralCode}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><Link href="/login" className="text-clay-400 font-medium">Iniciar sesión</Link></div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-clay-400 border-t-transparent rounded-full" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); window.location.reload(); }} className="px-4 py-2 bg-clay text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Agent view
  if (!agency && membership) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div><h1 className="text-3xl font-bold">🏢 {membership.agency.name}</h1><p className="text-neutral-500 mt-1">Eres agente de esta agencia</p></div>
          <div className="p-6 bg-white dark:bg-neutral-900 border rounded-xl text-center space-y-3">
            <p className="text-5xl">🏢</p>
            <p className="text-lg font-medium">Perteneces a <strong>{membership.agency.name}</strong></p>
            <p className="text-sm text-neutral-500">Las propiedades que publiques mostrarán el nombre de la agencia.</p>
          </div>
        </div>
      </div>
    );
  }

  // No agency
  if (!agency) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center space-y-6">
          <div className="text-5xl">🏢</div>
          <h1 className="text-2xl font-bold">¿Quieres registrar tu agencia?</h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            Trabajamos directamente con cada agencia para ofrecerte el mejor plan. Contáctanos por WhatsApp y te ayudamos a empezar.
          </p>
          {pricing && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-4">
              {pricing.plans.map((p) => (
                <div key={p.name} className="p-5 bg-white dark:bg-neutral-900 border rounded-xl text-center space-y-2">
                  <p className="font-bold text-lg">{p.label}</p>
                  <p className="text-2xl font-bold text-clay-400">${p.price.toLocaleString('es-MX')} <span className="text-sm text-neutral-500">/mes</span></p>
                  <p className="text-sm text-neutral-500">{p.agents} agentes · {p.leads} leads</p>
                  <p className="text-xs text-neutral-400">+${pricing.extraAgentCost} MXN por agente extra</p>
                </div>
              ))}
            </div>
          )}
          <a href={`https://wa.me/${WHATSAPP}?text=Hola,%20me%20interesa%20registrar%20mi%20agencia%20en%20Casa-MX`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-lg">
            💬 Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // Owner view
  const agentCount = agency._count?.members ?? agentData.total;
  const limit = agency.agentLimit || 1;
  const pct = limit > 0 ? Math.min(Math.round((agentCount / limit) * 100), 100) : 0;
  const planPrice = agency.pricing?.planPrice || 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{agency.name}</h1>
          <p className="text-neutral-500 mt-1">Panel de gestión</p>
        </div>

        {/* Plan card */}
        <div className="p-6 bg-white dark:bg-neutral-900 border rounded-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${agency.billingActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600'}`}>
                  {agency.billingActive ? 'Activo' : new Date(agency.subscriptionEnds).getTime() < Date.now() ? 'Vencido' : 'Inactivo'}
                </span>
                <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-400">
                  {PLAN_LABELS[agency.plan] || 'Sin plan'}
                </span>
              </div>
              <p className="text-sm text-neutral-500">${planPrice.toLocaleString('es-MX')} MXN / mes</p>
            </div>

          {/* Agent limit bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Agentes: {agentCount} / {limit === 999 ? '∞' : limit}</span>
              {agency.billingActive && <span className="text-neutral-500">{pct}% usado</span>}
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full bg-clay-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {agency.subscriptionEnds && (
            <p className={`text-xs ${new Date(agency.subscriptionEnds).getTime() < Date.now() ? 'text-red-500 font-medium' : 'text-neutral-500'}`}>
              {new Date(agency.subscriptionEnds).getTime() < Date.now() ? '⚠️ Suscripción vencida el' : 'Próximo cobro:'} {new Date(agency.subscriptionEnds).toLocaleDateString('es-MX')}
            </p>
          )}
        </div>

        {/* Invite agents */}
        <div className="p-6 bg-white dark:bg-neutral-900 border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Invitar agentes</h2>
          <p className="text-sm text-neutral-500">Los agentes que se registren con tu enlace se vincularán automáticamente a tu agencia.</p>
          {agency.billingActive && agency.referralCode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-lg font-mono font-bold text-clay-600 dark:text-clay-400 text-center tracking-wider">{agency.referralCode}</code>
                <button onClick={handleCopyInvite}
                  className="px-4 py-3 rounded-lg font-semibold text-sm bg-clay-400 hover:bg-clay-500 text-white transition-all whitespace-nowrap">
                  {copied ? '¡Copiado!' : '📋 Copiar enlace'}
                </button>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent('Únete a mi agencia en Casa-MX.com: ' + FRONTEND_URL + '/register?agencia=' + agency.referralCode)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white text-center transition-colors">
                  💬 WhatsApp
                </a>
                <a href={`mailto:?subject=Únete a mi agencia en Casa-MX&body=Regístrate aquí: ${FRONTEND_URL}/register?agencia=${agency.referralCode}`}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-neutral-700 hover:bg-neutral-800 text-white text-center transition-colors">
                  ✉️ Correo
                </a>
              </div>

              {/* Manual add agent */}
              {!showAddAgent ? (
                <button onClick={() => setShowAddAgent(true)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-dashed border-clay-400 text-clay-500 hover:bg-clay-50 dark:hover:bg-clay-900/20 transition-colors">
                  ➕ Agregar agente manualmente (email y contraseña)
                </button>
              ) : (
                <div className="p-4 border border-clay-200 dark:border-clay-800 rounded-lg space-y-3 bg-clay-50/50 dark:bg-clay-900/10">
                  <p className="text-sm font-medium">Agregar agente</p>
                  <div className="grid gap-2">
                    <input type="text" placeholder="Nombre completo" value={newAgent.name}
                      onChange={e => setNewAgent(a => ({ ...a, name: e.target.value }))}
                      className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-neutral-800" />
                    <input type="email" placeholder="Email" value={newAgent.email}
                      onChange={e => setNewAgent(a => ({ ...a, email: e.target.value }))}
                      className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-neutral-800" />
                    <input type="password" placeholder="Contraseña (mín 8 caracteres)" value={newAgent.password}
                      onChange={e => setNewAgent(a => ({ ...a, password: e.target.value }))}
                      className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-neutral-800" />
                  </div>
                  {addAgentError && <p className="text-xs text-red-600">{addAgentError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleAddAgent} disabled={addingAgent}
                      className="flex-1 px-4 py-2 rounded-lg bg-clay-400 hover:bg-clay-500 disabled:opacity-50 text-white text-sm font-medium">
                      {addingAgent ? 'Creando...' : 'Crear agente'}
                    </button>
                    <button onClick={() => { setShowAddAgent(false); setAddAgentError(''); }}
                      className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Tu plan está inactivo. Contacta al administrador para activarlo.</p>
          )}
        </div>

        {/* Agent list */}
        <div className="p-6 bg-white dark:bg-neutral-900 border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Agentes ({agentCount})</h2>
          {agentData.agents?.length > 0 ? (
            <div className="space-y-2">
              {agentData.agents.map((a) => (
                <div key={a.id} className="flex items-center gap-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center text-clay-600 dark:text-clay-400 font-bold text-sm">
                    {a.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{a.email}</p>
                  </div>
                  <div className="text-xs text-neutral-400">{new Date(a.createdAt).toLocaleDateString('es-MX')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-6">Sin agentes aún.</p>
          )}
        </div>

        {/* Contact */}
        <div className="text-center pb-8">
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:underline">
            💬 ¿Necesitas ayuda? Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
