export const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  countered: 'Contraoferta enviada',
  approved: 'Aprobada',
  under_review: 'En revisión',
  expired: 'Expirada',
  withdrawn: 'Retirada',
};

export const STATUS_COLORS = {
  pending: 'bg-clay-100 text-clay-800 dark:bg-clay-900/30 dark:text-clay-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export const NOTIFICATION_TYPE_LABELS = {
  rental_application_received: 'Solicitud recibida',
  application_status_changed: 'Estado actualizado',
  offer_received: 'Oferta recibida',
  offer_accepted: 'Oferta aceptada',
  offer_rejected: 'Oferta rechazada',
  offer_countered: 'Contraoferta',
  contact_request_received: 'Solicitud de contacto',
  contact_request_approved: 'Dirección compartida',
  review_received: 'Nueva reseña',
};

export const NOTIFICATION_TYPE_COLORS = {
  rental_application_received: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
  application_status_changed: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
  offer_received: 'bg-clay-50 dark:bg-clay-900/10 border-clay-200 dark:border-clay-800',
  offer_accepted: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
  offer_rejected: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
  offer_countered: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
  contact_request_received: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
  review_received: 'bg-clay-50 dark:bg-clay-900/10 border-clay-200 dark:border-clay-800',
};

export const ROLE_STATUS_LABELS = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};
