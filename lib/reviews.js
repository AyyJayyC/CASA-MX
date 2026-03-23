export const REVIEW_ROLE_LABELS = {
  tenant: 'Inquilino',
  landlord: 'Arrendador',
};

export const REVIEWEE_ROLE_BY_REVIEWER_ROLE = {
  tenant: 'landlord',
  landlord: 'tenant',
};

export const REVIEW_CATEGORY_LABELS = {
  communication: 'Comunicación',
  payment_reliability: 'Pago puntual',
  property_care: 'Cuidado del inmueble',
  lease_compliance: 'Cumplimiento del contrato',
  overall_reliability: 'Confiabilidad general',
  listing_accuracy: 'Exactitud del anuncio',
  fairness: 'Trato justo',
  maintenance_responsiveness: 'Respuesta a mantenimiento',
  move_in_experience: 'Proceso de entrada',
};

export const REVIEW_CATEGORIES_BY_REVIEWER_ROLE = {
  tenant: [
    'communication',
    'listing_accuracy',
    'fairness',
    'maintenance_responsiveness',
    'move_in_experience',
  ],
  landlord: [
    'communication',
    'payment_reliability',
    'property_care',
    'lease_compliance',
    'overall_reliability',
  ],
};

export function getRoleLabel(role) {
  return REVIEW_ROLE_LABELS[role] || role;
}

export function getReviewCategoryLabel(category) {
  return REVIEW_CATEGORY_LABELS[category] || category;
}

export function getCategoriesForReviewerRole(role) {
  return REVIEW_CATEGORIES_BY_REVIEWER_ROLE[role] || [];
}

export function hasApprovedRole(user, role) {
  return Boolean(user?.roles?.some((item) => item.type === role && item.status === 'approved'));
}
