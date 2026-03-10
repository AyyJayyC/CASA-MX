/** Mock properties data for frontend (Phase 1) */
/**
 * Example mock list of properties following the frontend data contract.
 * UI language: Spanish; internal comments in English.
 * Checkpoint 4: Added rental properties with listingType, monthlyRent, furnished, utilitiesIncluded
 */
export const properties = [
  // Sale properties
  {
    id: 'prop-1',
    title: 'Casa en la colonia Roma',
    description: 'Hermosa casa con patio y estacionamiento.',
    price: 4500000,
    listingType: 'for_sale',
    address: 'Calle Falsa 123',
    colonia: 'Roma Norte',
    propertyType: 'Casa',
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 180,
    photos: ['/images/sample1.jpg'],
    status: 'available',
    financeOptions: { cash: true, bankLoan: true, INFONAVIT: false, other: '' },
    uploadedBy: { id: 'user-1', name: 'Vendedor Demo' },
    latitude: null,
    longitude: null
  },
  {
    id: 'prop-2',
    title: 'Departamento en Polanco',
    description: 'Departamento moderno cerca de servicios.',
    price: 3200000,
    listingType: 'for_sale',
    address: 'Avenida Principal 45',
    colonia: 'Polanco',
    propertyType: 'Departamento',
    bedrooms: 2,
    bathrooms: 2,
    squareMeters: 95,
    photos: ['/images/sample2.jpg'],
    status: 'available',
    financeOptions: { cash: true, bankLoan: false, INFONAVIT: true, other: '' },
    uploadedBy: { id: 'user-2', name: 'Wholesaler Demo' },
    latitude: null,
    longitude: null
  },
  // Rental properties
  {
    id: 'prop-3',
    title: 'Departamento amueblado en Condesa',
    description: 'Departamento completamente amueblado, listo para mudarse. Incluye todos los servicios.',
    monthlyRent: 18000,
    listingType: 'for_rent',
    address: 'Avenida Amsterdam 100',
    colonia: 'Condesa',
    propertyType: 'Departamento',
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 75,
    furnished: true,
    utilitiesIncluded: true,
    securityDeposit: 18000,
    leaseTermMonths: 12,
    availableFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Available in 1 week
    photos: ['/images/sample3.jpg'],
    status: 'available',
    uploadedBy: { id: 'user-3', name: 'Landlord Demo' },
    latitude: null,
    longitude: null
  },
  {
    id: 'prop-4',
    title: 'Casa para renta en Coyoacán',
    description: 'Casa amplia con jardín, ideal para familias. Sin muebles.',
    monthlyRent: 25000,
    listingType: 'for_rent',
    address: 'Calle Morelos 456',
    colonia: 'Coyoacán Centro',
    propertyType: 'Casa',
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 150,
    furnished: false,
    utilitiesIncluded: false,
    securityDeposit: 50000,
    leaseTermMonths: 12,
    availableFrom: new Date().toISOString(), // Available now
    photos: ['/images/sample4.jpg'],
    status: 'available',
    uploadedBy: { id: 'user-4', name: 'Landlord Demo 2' },
    latitude: null,
    longitude: null
  },
  {
    id: 'prop-5',
    title: 'Estudio amueblado en Santa Fe',
    description: 'Estudio moderno completamente equipado, perfecto para profesionistas.',
    monthlyRent: 12000,
    listingType: 'for_rent',
    address: 'Prolongación Paseo de la Reforma 789',
    colonia: 'Santa Fe',
    propertyType: 'Departamento',
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 45,
    furnished: true,
    utilitiesIncluded: true,
    securityDeposit: 12000,
    leaseTermMonths: 6,
    availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Available in 2 weeks
    photos: ['/images/sample5.jpg'],
    status: 'available',
    uploadedBy: { id: 'user-5', name: 'Landlord Demo 3' },
    latitude: null,
    longitude: null
  },
  {
    id: 'prop-6',
    title: 'Departamento en renta San Ángel',
    description: 'Departamento sin muebles en zona tranquila, cerca de universidades.',
    monthlyRent: 15000,
    listingType: 'for_rent',
    address: 'Avenida Revolución 321',
    colonia: 'San Ángel',
    propertyType: 'Departamento',
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 80,
    furnished: false,
    utilitiesIncluded: false,
    securityDeposit: 30000,
    leaseTermMonths: 12,
    availableFrom: new Date().toISOString(), // Available now
    photos: ['/images/sample6.jpg'],
    status: 'available',
    uploadedBy: { id: 'user-6', name: 'Landlord Demo 4' },
    latitude: null,
    longitude: null
  }
];

/**
 * Add a property to the mock store.
 * Purpose: Simulate a backend create action for frontend-only flows.
 * @param {Object} property
 * @returns {Promise<Object>} The added property
 */
export function addProperty(property) {
  // assign a simple id and push to the in-memory array
  const id = `prop-${properties.length + 1}`;
  const toAdd = { id, ...property };
  properties.push(toAdd);
  return Promise.resolve(toAdd);
}

