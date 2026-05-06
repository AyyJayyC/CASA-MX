export const REVIEW_ROLE_LABELS = {
  seller: 'Vendedor',
  buyer: 'Comprador',
  wholesaler: 'Mayorista',
  admin: 'Administrador',
  tenant: 'Inquilino',
  landlord: 'Arrendador',
};

export const REVIEWEE_ROLE_BY_REVIEWER_ROLE = {
  tenant: 'landlord',
  landlord: 'tenant',
};

export function getRoleLabel(role) {
  return REVIEW_ROLE_LABELS[role] || role;
}

export function hasApprovedRole(user, role) {
  return Boolean(user?.roles?.some((item) => item.type === role && item.status === 'approved'));
}
