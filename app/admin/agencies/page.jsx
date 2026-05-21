'use client';
import React, { useEffect, useState } from 'react';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import { getAdminAgencies, updateAgency } from '@/lib/api/agencies';

const PLAN_LABELS = { inactive: 'Inactivo', basico: 'Básico', pro: 'Pro', empresarial: 'Empresarial', custom: 'Personalizado' };
const PLANS = ['inactive', 'basico', 'pro', 'empresarial', 'custom'];
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', legalName: '', rfc: '', ownerEmail: '', plan: 'basico', customCredits: 0 });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    getAdminAgencies().then((data) => { setAgencies(data); setLoading(false); });
  }, []);

  const handleUpdate = async (id, updates) => {
    setSaving(id);
    try {
      const updated = await updateAgency(id, updates);
      setAgencies((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    } catch {}
    setSaving(null);
  };

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.ownerEmail.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const body = {
        name: createForm.name.trim(),
        legalName: createForm.legalName.trim() || undefined,
        rfc: createForm.rfc.trim() || undefined,
        ownerEmail: createForm.ownerEmail.trim(),
        plan: createForm.plan,
        billingActive: true,
      };
      if (createForm.plan === 'custom') {
        body.agentLimit = createForm.agentLimit || 0;
      }
      const res = await fetch(`${BACKEND_URL}/agencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setAgencies((prev) => [data.data, ...prev]);
      setCreateForm({ name: '', legalName: '', rfc: '', ownerEmail: '', plan: 'basico' });
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.message || 'Error al crear la agencia');
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <RequireRole roles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-clay-400 border-t-transparent rounded-full" />
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole roles={['admin']}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Agencias</h1>
            <p className="text-sm text-neutral-500">{agencies.length} agencias registradas</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded-lg bg-clay-400 hover:bg-clay-500 text-white font-semibold text-sm transition-colors">
            {showCreate ? 'Cancelar' : '+ Nueva agencia'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-clay-200 dark:border-clay-800 rounded-xl space-y-4">
            <h3 className="font-semibold text-lg">Registrar nueva agencia</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la agencia *</label>
                <input value={createForm.name} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Grupo Inmobiliario MX" className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email del dueño *</label>
                <input value={createForm.ownerEmail} onChange={(e) => setCreateForm(f => ({ ...f, ownerEmail: e.target.value }))}
                  placeholder="dueño@agencia.com" className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Razón social</label>
                <input value={createForm.legalName} onChange={(e) => setCreateForm(f => ({ ...f, legalName: e.target.value }))}
                  placeholder="S.A. de C.V." className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RFC</label>
                <input value={createForm.rfc} onChange={(e) => setCreateForm(f => ({ ...f, rfc: e.target.value.toUpperCase().slice(0, 13) }))}
                  placeholder="ABC123456XYZ" className="w-full px-3 py-2 rounded-lg border text-sm uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select value={createForm.plan} onChange={(e) => setCreateForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm">
                  {PLANS.filter(p => p !== 'inactive').map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                </select>
              </div>
              {createForm.plan === 'custom' && (
                <div className="sm:col-span-2 grid grid-cols-2 gap-4 p-4 bg-clay-50 dark:bg-clay-900/10 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Límite de agentes</label>
                    <input type="number" min={0} max={999} value={createForm.agentLimit || 0} onChange={(e) => setCreateForm(f => ({ ...f, agentLimit: Math.max(0, parseInt(e.target.value) || 0) }))}
                      placeholder="0 = ilimitado" className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Créditos iniciales</label>
                    <input type="number" min={0} value={createForm.customCredits || 0} onChange={(e) => setCreateForm(f => ({ ...f, customCredits: Math.max(0, parseInt(e.target.value) || 0) }))}
                      placeholder="0" className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                </div>
              )}
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <button onClick={handleCreate} disabled={creating}
              className="px-6 py-2.5 rounded-lg bg-clay-400 hover:bg-clay-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {creating ? 'Creando...' : 'Crear agencia'}
            </button>
          </div>
        )}

        {agencies.length === 0 && !showCreate ? (
          <div className="text-center py-16 text-neutral-400 space-y-3">
            <p className="text-5xl">🏢</p>
            <p>No hay agencias registradas.</p>
            <p className="text-sm">Haz clic en "+ Nueva agencia" para registrar la primera.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agencies.map((agency) => (
              <div key={agency.id} className="p-6 bg-white dark:bg-neutral-900 border rounded-xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{agency.name}</h3>
                    <p className="text-sm text-neutral-500">{agency.legalName || agency.name} {agency.rfc ? `· RFC: ${agency.rfc}` : ''}</p>
                    <p className="text-sm text-neutral-500">Dueño: {agency.owner?.name} ({agency.owner?.email})</p>
                    <p className="text-sm text-neutral-500">Agentes: {agency._count?.members || 0} / {agency.agentLimit || 0}</p>
                    {(agency.pricing?.planPrice > 0 || agency.plan === 'custom') && (
                      <p className="text-sm text-clay-600 font-medium">
                        ${(agency.pricing?.planPrice || 0).toLocaleString('es-MX')} MXN / mes
                      </p>
                    )}
                    {agency.subscriptionEnds && (
                      <p className={`text-xs mt-0.5 ${new Date(agency.subscriptionEnds) < new Date() ? 'text-red-500 font-medium' : 'text-neutral-400'}`}>
                        {new Date(agency.subscriptionEnds) < new Date() ? '⚠️ Vencido: ' : 'Próximo cobro: '}
                        {new Date(agency.subscriptionEnds).toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 min-w-48">
                    <select value={agency.plan} onChange={(e) => handleUpdate(agency.id, {
                      plan: e.target.value,
                      agentLimit: e.target.value === 'custom' ? agency.agentLimit : ({ inactive: 0, basico: 3, pro: 10, empresarial: 25 }[e.target.value] || 0),
                    })} disabled={saving === agency.id}
                      className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-neutral-800">
                      {PLANS.map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input type="number" min={0} max={999} value={agency.agentLimit || 0}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setAgencies((prev) => prev.map((a) => (a.id === agency.id ? { ...a, agentLimit: val } : a)));
                        }}
                        onBlur={() => handleUpdate(agency.id, { agentLimit: agency.agentLimit })}
                        className="w-20 px-2 py-2 rounded-lg border text-sm bg-white dark:bg-neutral-800" title="Límite de agentes" />
                      <button onClick={() => handleUpdate(agency.id, { billingActive: !agency.billingActive })}
                        disabled={saving === agency.id}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          agency.billingActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}>
                        {agency.billingActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
