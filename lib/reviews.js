export const ROLE_LABELS = {
  client: "Inquilino/Comprador",
  owner: "Arrendador/Vendedor",
  agent: "Agente",
  admin: "Administrador",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function hasApprovedRole(user, role) {
  return Boolean(
    user?.roles?.some(
      (item) => item.type === role && item.status === "approved",
    ),
  );
}
