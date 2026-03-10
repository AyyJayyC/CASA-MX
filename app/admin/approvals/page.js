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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending approvals
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const data = await usersAPI.getPendingApprovals();
        setApprovals(data);
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
      await usersAPI.approveRole({ userId, roleType });
      // Refresh list
      const data = await usersAPI.getPendingApprovals();
      setApprovals(data);
    } catch (err) {
      setError(err.message || 'Error approving role');
    }
  };

  const handleReject = async (userId, roleType) => {
    try {
      await usersAPI.rejectRole({ userId, roleType });
      // Refresh list
      const data = await usersAPI.getPendingApprovals();
      setApprovals(data);
    } catch (err) {
      setError(err.message || 'Error rejecting role');
    }
  };

  return (
    <RequireRole roles={['admin']}>
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Aprobación de Roles
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Revisa y aprueba las solicitudes de roles de usuarios
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-neutral-600 dark:text-neutral-400">Cargando aprobaciones pendientes...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Todo al día
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              No hay roles pendientes de aprobación
            </p>
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
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {approval.userName[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                            {approval.userName}
                          </h3>
                          <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-medium">
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

                  {/* Actions */}
                  <div className="flex gap-2 md:flex-shrink-0">
                    <button
                      onClick={() => handleApprove(approval.userId, approval.roleType)}
                      className="
                        flex-1 md:flex-none px-5 py-2.5
                        bg-green-600 hover:bg-green-700
                        dark:bg-green-600 dark:hover:bg-green-700
                        text-white font-medium text-sm
                        rounded-lg
                        transition-colors
                        shadow-sm hover:shadow
                      "
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(approval.userId, approval.roleType)}
                      className="
                        flex-1 md:flex-none px-5 py-2.5
                        bg-red-600 hover:bg-red-700
                        dark:bg-red-600 dark:hover:bg-red-700
                        text-white font-medium text-sm
                        rounded-lg
                        transition-colors
                        shadow-sm hover:shadow
                      "
                    >
                      ✕ Rechazar
                    </button>
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
