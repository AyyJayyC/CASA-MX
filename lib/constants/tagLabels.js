export const TAG_LABELS = {
  perfil: {
    flipper: "Flipper",
    buy_hold: "Buy & Hold",
    wholesaler: "Wholesaler",
    developer: "Desarrollador",
    realtor: "Realtor",
    owner: "Propietario",
  },
  enfoque: {
    residencial: "Residencial",
    comercial: "Comercial",
    terrenos: "Terrenos",
    industrial: "Industrial",
    mixto: "Mixto",
  },
  operacion: {
    cash: "Contado",
    credit: "Crédito",
    infonavit: "INFONAVIT",
    subject_to: "Sujeto a",
    assume_loan: "Asume hipoteca",
  },
  zona: {
    norte: "Norte",
    bajio: "Bajío",
    centro: "Centro",
    occidente: "Occidente",
    sureste: "Sureste",
    todo_mexico: "Todo México",
  },
  actividad: {
    principiante: "Principiante",
    intermedio: "Intermedio",
    profesional: "Profesional",
    alto_volumen: "Alto volumen",
  },
};

export function getTagLabel(value) {
  for (const cat of Object.values(TAG_LABELS)) {
    if (cat[value]) return cat[value];
  }
  return value;
}
