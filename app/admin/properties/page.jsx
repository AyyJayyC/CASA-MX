'use client';

import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/guards/RequireRole';
import {
  getPropertiesPendingVerification,
  adminVerifyProperty,
  getPropertyDocuments,
} from '@/lib/api/propertyDocuments';

const STATUS_LABELS = {
  unverified:    { label: 'Sin documentos', color: 'text-gray-500 bg-gray-100' },
  docs_uploaded: { label: 'Docs subidos',   color: 'text-amber-700 bg-amber-100' },
  verified:      { label: 'Verificado',     color: 'text-green-700 bg-green-100' },
  rejected:      { label: 'Rechazado',      color: 'text-red-700 bg-red-100' },
};

const DOC_TYPE_LABELS = {
  title_deed:           'Escritura',
  official_id:          'ID oficial',
  agent_authorization:  'Carta autorización',
  other:                'Otro',
};

function PropertyRow({ property, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [docs, setDocs] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);

  async function loadDocs() {
    if (docs !== null) { setExpanded((v) => !v); return; }
    setExpanded(true);
    setDocsLoading(true);
    try {
      const fetched = await getPropertyDocuments(property.id);
      setDocs(fetched);
    } catch {
      setDocs([]);
    } finally {
      setDocsLoading(false);
    }
  }

  async function handle(status) {
    setActing(true);
    try {
      await adminVerifyProperty(property.id, status, note || undefined);
      onAction(property.id, status);
    } catch (err) {
      alert(err.message);
    } finally {
      setActing(false);
    }
  }

  const st = STATUS_LABELS[property.verificationStatus] ?? STATUS_LABELS.unverified;

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-neutral-900">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{property.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {property.seller?.name} &middot; {property.seller?.email} &middot; ID: {property.id}
          </p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
          {st.label}
        </span>
        <button
          onClick={loadDocs}
          className="shrink-0 text-xs text-blue-600 hover:underline"
          type="button"
        >
          {expanded ? 'Ocultar' : 'Ver docs'}
        </button>
      </div>

      {/* Expanded docs + actions */}
      {expanded && (
        <div className="border-t px-4 py-3 bg-gray-50 dark:bg-neutral-800 space-y-3">
          {docsLoading && <p className="text-sm text-gray-500">Cargando documentos…</p>}

          {!docsLoading && docs?.length === 0 && (
            <p className="text-sm text-gray-500">Sin documentos subidos.</p>
          )}

          {!docsLoading && docs?.length > 0 && (
            <ul className="space-y-1">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-36 shrink-0">
                    {DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                  </span>
                  {doc.presignedUrl ? (
                    <a
                      href={doc.presignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {doc.fileName} ↗
                    </a>
                  ) : (
                    <span className="text-gray-500 truncate">{doc.fileName}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional (visible para el vendedor si se rechaza)"
              rows={2}
              className="w-full text-sm rounded-lg border border-gray-300 dark:border-neutral-600 px-3 py-2 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handle('verified')}
                disabled={acting}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium transition"
                type="button"
              >
                ✅ Aprobar
              </button>
              <button
                onClick={() => handle('rejected')}
                disabled={acting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium transition"
                type="button"
              >
                ❌ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPropertiesPendingVerification();
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleAction(propertyId, newStatus) {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, verificationStatus: newStatus } : p))
    );
  }

  return (
    <RequireRole role="admin">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Verificación de propiedades
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa los documentos de propiedad subidos por vendedores y aprueba o rechaza cada listado.
          </p>
        </div>

        {loading && <p className="text-gray-500">Cargando…</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && !error && properties.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-400">
            No hay propiedades pendientes de verificación.
          </div>
        )}

        {!loading && properties.map((p) => (
          <PropertyRow key={p.id} property={p} onAction={handleAction} />
        ))}
      </div>
    </RequireRole>
  );
}
