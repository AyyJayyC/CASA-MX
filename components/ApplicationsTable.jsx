/**
 * ApplicationsTable component
 * Purpose: Display rental applications in a table with approve/reject actions
 * Design: Responsive table with action modals and status updates
 * Checkpoint 6: Integrates with backend API for application management
 */
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LeaveReviewModal from './LeaveReviewModal.jsx';
import ReviewSummaryCard from './ReviewSummaryCard.jsx';
import { getPropertyApplications, updateApplicationStatus } from '@/lib/api/applications';
import { getMyAuthoredReviews, getReviewSummary } from '@/lib/api/reviews';
import { useCredits } from '@/lib/auth/CreditsContext';

const ApproveRejectModal = dynamic(() => import('./ApproveRejectModal.jsx'), { ssr: false });
const NegotiationPanel = dynamic(() => import('./NegotiationPanel.jsx'), { ssr: false });

const statusBadgeConfig = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pendiente' },
  under_review: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'En revisión' },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Aprobada' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Rechazada' },
};

export default function ApplicationsTable({ propertyId, propertyTitle, propertyMonthlyRent, landlordId, statusFilter }) {
  const { spend, balance } = useCredits();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewedApplicationIds, setReviewedApplicationIds] = useState([]);
  // Contacts revealed during this session (after spending a credit).
  // API also returns non-null email/phone for leads unlocked in previous sessions.
  const [unlockedContacts, setUnlockedContacts] = useState({});
  const [unlocking, setUnlocking] = useState(null); // applicationId being unlocked

  // Resolve the effective contact for an application (session unlock OR already-unlocked from API).
  const getContact = (app) =>
    unlockedContacts[app.id] ??
    (app.email ? { email: app.email, phone: app.phone, fullName: app.fullName } : null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [applicationsData, reviewsData] = await Promise.all([
          getPropertyApplications(propertyId),
          getMyAuthoredReviews('landlord'),
        ]);

        setApplications(applicationsData || []);
        setReviewedApplicationIds(
          (reviewsData || [])
            .map((review) => review.rentalApplicationId)
            .filter(Boolean)
        );
      } catch (err) {
        setError(err.message || 'Error al cargar solicitudes');
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchApplications();
    }
  }, [propertyId]);

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  const handleApproveReject = async (action, note) => {
    if (!selectedApp) return;

    setIsSubmitting(true);
    try {
      const updatedApp = await updateApplicationStatus(selectedApp.id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        landlordNote: note,
      });

      // Update local state
      setApplications(apps =>
        apps.map(app =>
          app.id === selectedApp.id
            ? { ...app, ...updatedApp }
            : app
        )
      );

      setSelectedApp(null);
      setActionType(null);
    } catch (err) {
      alert('Error: ' + (err.message || 'Error al actualizar solicitud'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async (app) => {
    setUnlocking(app.id);
    try {
      const result = await spend(app.id, 'application');
      if (result.success && result.contact) {
        setUnlockedContacts(prev => ({ ...prev, [app.id]: result.contact }));
      }
    } catch (err) {
      if (err.status === 402) {
        alert('Saldo insuficiente. Ve a Créditos para comprar más.');
      } else {
        alert(err.message || 'Error al desbloquear contacto');
      }
    } finally {
      setUnlocking(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-amber-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (filteredApplications.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No hay solicitudes
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {statusFilter === 'all' 
            ? 'No hay solicitudes para esta propiedad'
            : `No hay solicitudes con estado "${statusBadgeConfig[statusFilter]?.label}"`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Solicitante</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Contacto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Ingreso</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-100">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredApplications.map((app) => {
              const statusConfig = statusBadgeConfig[app.status];
              return (
                <tr key={app.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {getContact(app) ? app.fullName : app.fullName.split(' ')[0]}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Inquilinos: {app.numberOfOccupants}
                      </div>
                      {!getContact(app) && (
                        <div className="text-xs text-neutral-400 mt-0.5">Apellidos ocultos</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getContact(app) ? (
                      <div className="text-sm">
                        <div className="text-neutral-900 dark:text-neutral-100">{getContact(app).email}</div>
                        <div className="text-neutral-600 dark:text-neutral-400">{getContact(app).phone}</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUnlock(app)}
                        disabled={unlocking === app.id}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 disabled:opacity-50"
                      >
                        🔓 {unlocking === app.id ? 'Desbloqueando...' : 'Ver contacto (1 crédito)'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      ${app.monthlyIncome?.toLocaleString('es-MX')} MXN/mes
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(app.status === 'pending' || app.status === 'under_review') && (
                        <>
                          <button
                            onClick={() => { setSelectedApp(app); setActionType('approve'); }}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => { setSelectedApp(app); setActionType('reject'); }}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => { setSelectedApp(app); setActionType(null); }}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Negociar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredApplications.map((app) => {
          const statusConfig = statusBadgeConfig[app.status];
          return (
            <div
              key={app.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getContact(app) ? app.fullName : app.fullName.split(' ')[0]}
                    {!getContact(app) && <span className="ml-1 text-xs text-neutral-400">(apellidos ocultos)</span>}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    ${app.monthlyIncome?.toLocaleString('es-MX')} MXN/mes
                  </div>
                  {getContact(app) ? (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {getContact(app).email} • {getContact(app).phone}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUnlock(app)}
                      disabled={unlocking === app.id}
                      className="mt-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 disabled:opacity-50"
                    >
                      🔓 {unlocking === app.id ? 'Desbloqueando...' : 'Ver contacto (1 crédito)'}
                    </button>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400">Ingreso</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    ${app.monthlyIncome?.toLocaleString('es-MX')}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-600 dark:text-neutral-400">Ocupantes</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {app.numberOfOccupants}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {(app.status === 'pending' || app.status === 'under_review') && (
                  <>
                    <button
                      onClick={() => { setSelectedApp(app); setActionType('approve'); }}
                      className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => { setSelectedApp(app); setActionType('reject'); }}
                      className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => { setSelectedApp(app); setActionType(null); }}
                      className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Negociar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedApp(app)}
                  className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Approve/Reject */}
      {selectedApp && actionType && (
        <ApproveRejectModal
          application={selectedApp}
          action={actionType}
          isSubmitting={isSubmitting}
          onSubmit={handleApproveReject}
          onClose={() => { setSelectedApp(null); setActionType(null); }}
        />
      )}

      {/* Details Modal */}
      {selectedApp && !actionType && (
        <ApplicationDetailsModal
          application={selectedApp}
          propertyMonthlyRent={propertyMonthlyRent}
          landlordId={landlordId}
          onClose={() => setSelectedApp(null)}
          onApprove={() => setActionType('approve')}
          onReject={() => setActionType('reject')}
          onReview={() => setReviewModalApp(selectedApp)}
          hasSubmittedReview={reviewedApplicationIds.includes(selectedApp.id)}
          unlockedContact={getContact(selectedApp)}
          onUnlock={() => handleUnlock(selectedApp)}
          isUnlocking={unlocking === selectedApp.id}
        />
      )}

      <LeaveReviewModal
        isOpen={Boolean(reviewModalApp)}
        onClose={() => setReviewModalApp(null)}
        rentalApplicationId={reviewModalApp?.id}
        reviewerRole="landlord"
        revieweeName={reviewModalApp?.fullName}
        propertyTitle={reviewModalApp?.property?.title || propertyTitle}
        onSubmitted={() => {
          if (!reviewModalApp) return;
          setReviewedApplicationIds((current) => [...new Set([...current, reviewModalApp.id])]);
        }}
      />
    </div>
  );
}

// Application Details Modal Component
function ApplicationDetailsModal({ application, propertyMonthlyRent, landlordId, onClose, onApprove, onReject, onReview, hasSubmittedReview, unlockedContact, onUnlock, isUnlocking }) {
  const statusConfig = statusBadgeConfig[application.status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Detalles de solicitud
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Información Personal
            </h3>
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

          {/* Employment Info */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Empleador</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{application.employer}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Puesto</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{application.jobTitle}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Ingreso Mensual</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  ${application.monthlyIncome?.toLocaleString('es-MX')} MXN
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Tiempo en Empleo</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{application.employmentDuration}</div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Detalles de Renta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Fecha de Mudanza</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {new Date(application.desiredMoveInDate).toLocaleDateString('es-MX')}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Término de Contrato</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {application.desiredLeaseTerm} meses
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Estado:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {application.applicantId && (
            <ApplicantReviewSummary applicantId={application.applicantId} />
          )}

          {/* Documents */}
          {(application.idDocumentUrl || application.incomeProofUrl || (application.additionalDocsUrls && application.additionalDocsUrls.length > 0)) && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Documentos</h3>
              <div className="flex flex-wrap gap-3">
                {application.idDocumentUrl && (
                  <a
                    href={application.idDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    📄 Identificación
                  </a>
                )}
                {application.incomeProofUrl && (
                  <a
                    href={application.incomeProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    📄 Comprobante de ingresos
                  </a>
                )}
                {(application.additionalDocsUrls || []).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    📎 Documento adicional {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Negotiation */}
          {landlordId && propertyMonthlyRent != null && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Negociación de renta</h3>
              <NegotiationPanel
                applicationId={application.id}
                originalRent={propertyMonthlyRent}
                applicantId={application.applicantId}
                landlordId={landlordId}
              />
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {(application.status === 'pending' || application.status === 'under_review') && (
          <div className="sticky bottom-0 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6 flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={onApprove}
              className="flex-1 px-4 py-2 bg-gradient-to-br from-green-400 to-green-600 text-white font-medium rounded-lg hover:from-green-500 hover:to-green-700 transition-colors"
            >
              Aprobar
            </button>
          </div>
        )}

        {application.status === 'approved' && (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6 space-y-3">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/contracts/rental/${application.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Contrato de Arrendamiento
            </a>
            {application.applicantId && (
              <button
                onClick={onReview}
                disabled={hasSubmittedReview}
                className="w-full px-4 py-2 bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-medium rounded-lg hover:from-amber-500 hover:to-yellow-700 disabled:opacity-60 transition-colors"
              >
                {hasSubmittedReview ? 'Reseña enviada para este inquilino' : 'Calificar inquilino'}
              </button>
            )}
          </div>
        )}

        <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicantReviewSummary({ applicantId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviewSummary(applicantId, 'tenant');

        if (!cancelled) {
          setSummary(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'No se pudo cargar la reputación del inquilino');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
      <ReviewSummaryCard
        summary={summary}
        role="tenant"
        loading={loading}
        error={error}
        title="Reputación del inquilino"
        emptyMessage="Este inquilino aún no tiene reseñas verificadas en Casa-MX.com."
      />
    </div>
  );
}

