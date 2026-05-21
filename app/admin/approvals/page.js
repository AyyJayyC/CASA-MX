'use client';

/**
 * Admin Approvals Page
 * Purpose: View and approve/reject pending user roles
 */

import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/guards/RequireRole';
import * as usersAPI from '@/lib/api/users';

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [docNotes, setDocNotes] = useState({});

  const refreshData = async () => {
    const [rolesData, docsData] = await Promise.all([
      usersAPI.getPendingApprovals(),
      usersAPI.getPendingUserDocuments(),
    ]);
    setApprovals(rolesData);
    setPendingDocuments(docsData);
  };

  // Fetch pending approvals
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        await refreshData();
      } catch (err) {
        setError(err.message || 'Error fetching approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleApprove = async (userId, roleType) => {
    try {
      setError(null);
      setMessage(null);
      await usersAPI.approveRole({ userId, roleType });
      await refreshData();
      setMessage('Rol aprobado correctamente.');
    } catch (err) {
      setError(err.message || 'Error approving role');
    }
  };

  const handleReject = async (userId, roleType) => {
    try {
      setError(null);
      setMessage(null);
      await usersAPI.rejectRole({ userId, roleType });
      await refreshData();
      setMessage('Rol rechazado correctamente.');
    } catch (err) {
      setError(err.message || 'Error rejecting role');
    }
  };

  const handleApproveDocument = async (documentId) => {
    try {
      const note = docNotes[documentId]?.trim() || undefined;
      setError(null);
      setMessage(null);
      await usersAPI.approveUserDocument(documentId, note);
      await refreshData();
      setDocNotes((prev) => ({ ...prev, [documentId]: '' }));
      setMessage('Documento aprobado correctamente.');
    } catch (err) {
      setError(err.message || 'Error approving document');
    }
  };

  const handleRejectDocument = async (documentId) => {
    try {
      const note = docNotes[documentId]?.trim() || undefined;
      setError(null);
      setMessage(null);
      await usersAPI.rejectUserDocument(documentId, note);
      await refreshData();
      setDocNotes((prev) => ({ ...prev, [documentId]: '' }));
      setMessage('Documento rechazado correctamente.');
    } catch (err) {
      setError(err.message || 'Error rejecting document');
    }
  };

  return (
    <RequireRole roles={['admin']}>
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Aprobaciones
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Revisa y aprueba solicitudes de roles e identificaciones oficiales
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-clay-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-neutral-600 dark:text-neutral-400">Cargando aprobaciones pendientes...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Roles pendientes</h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{approvals.length}</span>
              </div>

              {approvals.length === 0 ? (
                <div className="text-center py-10 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">Sin roles pendientes</h3>
                </div>
              ) : (
                <div className="grid gap-4">
                  {approvals.map((approval) => (
                    <div
                      key={`${approval.userId}-${approval.roleType}`}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-clay-400 to-clay-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                              {approval.userName[0].toUpperCase()}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                                  {approval.userName}
                                </h3>
                                <span className="px-2.5 py-0.5 bg-clay-100 dark:bg-clay-900/30 text-clay-800 dark:text-clay-400 rounded-full text-xs font-medium">
                                  {approval.roleType}
                                </span>
                              </div>
                              <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                                {approval.userEmail}
                              </p>
                              <p className="text-neutral-500 dark:text-neutral-500 text-xs">
                                📅 Solicitado: {new Date(approval.requestedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 md:flex-shrink-0">
                          <button
                            onClick={() => handleApprove(approval.userId, approval.roleType)}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm hover:shadow"
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(approval.userId, approval.roleType)}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm hover:shadow"
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Identificaciones oficiales pendientes</h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{pendingDocuments.length}</span>
              </div>

              {pendingDocuments.length === 0 ? (
                <div className="text-center py-10 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">Sin identificaciones pendientes</h3>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{doc.user?.name || 'Usuario'}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{doc.user?.email}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                            Archivo: {doc.fileName} · Subido: {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                          </p>
                          {doc.viewUrl && (
                            <a
                              href={doc.viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-sm text-clay-600 dark:text-clay-400 hover:underline"
                            >
                              Ver documento
                            </a>
                          )}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                              Nota de revisión (opcional)
                            </label>
                            <textarea
                              value={docNotes[doc.id] || ''}
                              onChange={(e) => setDocNotes((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                              placeholder="Ej. Documento legible y válido / Falta claridad en el nombre"
                              rows={2}
                              className="w-full max-w-xl rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm px-3 py-2 text-neutral-900 dark:text-neutral-100"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 md:flex-shrink-0">
                          <button
                            onClick={() => handleApproveDocument(doc.id)}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg"
                          >
                            ✓ Verificar ID
                          </button>
                          <button
                            onClick={() => handleRejectDocument(doc.id)}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg"
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
