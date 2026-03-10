/**
 * ApproveRejectModal component
 * Purpose: Modal for approving or rejecting applications with optional notes
 * Design: Clean modal with form validation
 * Checkpoint 6: Handles approval/rejection logic with backend integration
 */
'use client';
import { useState } from 'react';

export default function ApproveRejectModal({
  application,
  action,
  isSubmitting,
  onSubmit,
  onClose,
}) {
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const isApprove = action === 'approve';
  const title = isApprove ? 'Aprobar solicitud' : 'Rechazar solicitud';
  const confirmText = isApprove ? 'Aprobar' : 'Rechazar';
  const confirmColor = isApprove
    ? 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
    : 'bg-red-600 hover:bg-red-700';
  const notePlaceholder = isApprove
    ? 'Agregar nota (opcional)...'
    : 'Explicar razón del rechazo (requerido)';
  const noteRequired = !isApprove;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (noteRequired && !note.trim()) {
      setError('La razón del rechazo es requerida');
      return;
    }

    try {
      await onSubmit(action, note.trim());
    } catch (err) {
      setError(err.message || 'Error al procesar solicitud');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Application Info */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 space-y-2 mb-6">
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Solicitante</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {application.fullName}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Email</div>
              <div className="text-sm text-neutral-900 dark:text-neutral-100">
                {application.email}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Note Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Nota {noteRequired && <span className="text-red-600">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              disabled={isSubmitting}
              rows="4"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500"
            />
            {noteRequired && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Se requiere una nota para rechazar la solicitud
              </p>
            )}
          </div>

          {/* Warning Message */}
          {isApprove && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-300 text-sm">
              ⓘ Al aprobar esta solicitud, todas las demás solicitudes pendientes para esta propiedad serán rechazadas automáticamente.
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 ${confirmColor} text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors`}
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
