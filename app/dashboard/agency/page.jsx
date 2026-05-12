'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import Link from 'next/link';
import { getMyAgency, getMyAgents } from '@/lib/api/agencies';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export default function AgencyPage() {
  const { user, isAuthenticated } = useAuth();
  const [agency, setAgency] = useState(null);
  const [agents, setAgents] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      const a = await getMyAgency();
      setAgency(a);
      if (a) {
        const ags = await getMyAgents();
        setAgents(ags);
      }
      setLoading(false);
    };

    load();
  }, [isAuthenticated]);

  const handleCopyInviteLink = () => {
    if (!agency?.referralCode) return;
    const url = `${FRONTEND_URL}/register?agencia=${agency.referralCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">Debes iniciar sesión para ver esta página.</p>
          <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center space-y-4">
          <div className="text-4xl">🏢</div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">No tienes una agencia</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Si eres dueño de una agencia y quieres gestionarla en Casa-MX.com, contacta al administrador.
          </p>
          <Link href="/dashboard" className="inline-block px-6 py-3 rounded-lg font-semibold text-sm bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-white transition-all">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{agency.name}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Panel de gestión de agencia</p>
        </div>

        {/* Agency Info */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Información de la agencia</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Nombre</dt>
              <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{agency.name}</dd>
            </div>
            {agency.legalName && (
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">Razón social</dt>
                <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{agency.legalName}</dd>
              </div>
            )}
            {agency.rfc && (
              <div>
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">RFC</dt>
                <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{agency.rfc}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Agentes registrados</dt>
              <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{agency._count?.members ?? agents.length}</dd>
            </div>
          </dl>
        </div>

        {/* Invite Agents */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Invitar agentes</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Comparte este enlace con los agentes que quieras agregar a tu agencia. Al registrarse, se vincularán automáticamente.
          </p>
          {agency.referralCode && (
            <div className="flex items-center gap-3 mt-2">
              <code className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-lg font-mono font-bold text-amber-700 dark:text-amber-400">
                {agency.referralCode}
              </code>
              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-white transition-all"
              >
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
            </div>
          )}
        </div>

        {/* Agents List */}
        <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Agentes</h2>
          {agents.length > 0 ? (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm">
                    {agent.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{agent.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{agent.email}</p>
                  </div>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(agent.createdAt).toLocaleDateString('es-MX')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
              <p className="text-sm">Aún no hay agentes registrados.</p>
              <p className="text-xs mt-1">Comparte el enlace de invitación para agregar agentes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
