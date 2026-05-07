'use client';

import dynamic from 'next/dynamic';
import ApplicantReviewSummary from './ApplicantReviewSummary.jsx';

const NegotiationPanel = dynamic(() => import('./NegotiationPanel.jsx'));

const statusBadgeConfig = {
  pending: { label: 'Pendiente', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  under_review: { label: 'En Revisión', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
  approved: { label: 'Aprobada', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  rejected: { label: 'Rechazada', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
};

export default function ApplicationDetailsModal({
  application,
  propertyMonthlyRent,
  landlordId,
  onClose,
  onApprove,
  onReject,
  onReview,
  hasSubmittedReview,
  unlockedContact,
  onUnlock,
  isUnlocking,
}) {
  const statusConfig = statusBadgeConfig[application.status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Detalles de solicitud
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Información Personal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Nombre</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {unlockedContact ? application.fullName : application.fullName.split(' ')[0]}
                  {!unlockedContact && <span className="ml-1 text-xs text-neutral-400">(apellidos ocultos)</span>}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Email</div>
                {unlockedContact ? (
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">{unlockedContact.email}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-neutral-400 dark:text-neutral-600 blur-sm select-none">••••••@•••.com</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Teléfono</div>
                {unlockedContact ? (
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">{unlockedContact.phone}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-neutral-400 dark:text-neutral-600 blur-sm select-none">+52 •••• ••••••</div>
                  </div>
                )}
              </div>
              {!unlockedContact && (
                <div className="col-span-2">
                  <button
                    onClick={onUnlock}
                    disabled={isUnlocking}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    🔓 {isUnlocking ? 'Desbloqueando...' : 'Ver contacto completo (1 crédito)'}
                  </button>
                </div>
              )}
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Ocupantes</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{application.numberOfOccupants}</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Información Laboral</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Empleador</div><div className="font-medium text-neutral-900 dark:text-neutral-100">{application.employer}</div></div>
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Puesto</div><div className="font-medium text-neutral-900 dark:text-neutral-100">{application.jobTitle}</div></div>
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Ingreso Mensual</div><div className="font-medium text-neutral-900 dark:text-neutral-100">${application.monthlyIncome?.toLocaleString('es-MX')} MXN</div></div>
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Tiempo en Empleo</div><div className="font-medium text-neutral-900 dark:text-neutral-100">{application.employmentDuration}</div></div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Detalles de Renta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Fecha de Mudanza</div><div className="font-medium text-neutral-900 dark:text-neutral-100">{new Date(application.desiredMoveInDate).toLocaleDateString('es-MX')}</div></div>
              <div><div className="text-sm text-neutral-600 dark:text-neutral-400">Término de Contrato</div><div className="font-medium text-neutral-900 dark:text-neutral-100">{application.desiredLeaseTerm} meses</div></div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Estado:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
            </div>
          </div>

          {application.applicantId && <ApplicantReviewSummary applicantId={application.applicantId} />}

          {(application.idDocumentUrl || application.incomeProofUrl || (application.additionalDocsUrls && application.additionalDocsUrls.length > 0)) && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Documentos</h3>
              <div className="flex flex-wrap gap-3">
                {application.idDocumentUrl && (
                  <a href={application.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">📄 Identificación</a>
                )}
                {application.incomeProofUrl && (
                  <a href={application.incomeProofUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">📄 Comprobante de ingresos</a>
                )}
                {(application.additionalDocsUrls || []).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">📎 Documento adicional {i + 1}</a>
                ))}
              </div>
            </div>
          )}

          {landlordId && propertyMonthlyRent != null && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Negociación de renta</h3>
              <NegotiationPanel applicationId={application.id} originalRent={propertyMonthlyRent} applicantId={application.applicantId} landlordId={landlordId} />
            </div>
          )}
        </div>

        {(application.status === 'pending' || application.status === 'under_review') && (
          <div className="sticky bottom-0 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6 flex gap-3">
            <button onClick={onReject} className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Rechazar</button>
            <button onClick={onApprove} className="flex-1 px-4 py-2 bg-gradient-to-br from-green-400 to-green-600 text-white font-medium rounded-lg hover:from-green-500 hover:to-green-700 transition-colors">Aprobar</button>
          </div>
        )}

        {application.status === 'approved' && (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6 space-y-3">
            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/contracts/rental/${application.id}`} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Descargar Contrato de Arrendamiento
            </a>
            {application.applicantId && (
              <button onClick={onReview} disabled={hasSubmittedReview} className="w-full px-4 py-2 bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-medium rounded-lg hover:from-amber-500 hover:to-yellow-700 disabled:opacity-60 transition-colors">
                {hasSubmittedReview ? 'Reseña enviada para este inquilino' : 'Calificar inquilino'}
              </button>
            )}
          </div>
        )}

        <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6">
          <button onClick={onClose} className="w-full px-4 py-2 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
