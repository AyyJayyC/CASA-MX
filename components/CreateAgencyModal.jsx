'use client';
import React, { useState } from 'react';
import { createAgency } from '@/lib/api/agencies';

export default function CreateAgencyModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [rfc, setRfc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const agency = await createAgency({ name: name.trim(), legalName: legalName.trim() || undefined, rfc: rfc.trim() || undefined });
      onCreated(agency);
    } catch (err) {
      setError(err.message || 'Error al crear la agencia');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Crear agencia</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre de la agencia *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Grupo Inmobiliario MX"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Razón social</label>
            <input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Ej: Grupo Inmobiliario MX S.A. de C.V."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">RFC</label>
            <input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase().slice(0, 13))} placeholder="Ej: GIM123456XYZ"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm uppercase" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button onClick={handleCreate} disabled={submitting || !name.trim()}
          className="w-full py-3 bg-clay-400 hover:bg-clay-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
          {submitting ? 'Creando...' : 'Crear agencia'}
        </button>
      </div>
    </div>
  );
}
