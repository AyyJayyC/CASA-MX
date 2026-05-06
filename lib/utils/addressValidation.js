/**
 * Address Validation Utility
 * Purpose: Validate Mexican addresses and provide helpful warnings
 * Checks: format, required fields, known locations, postal codes
 */

import mexicanLocations from '../data/mexican-locations.json';

/**
 * Validation result object
 */
function createValidationResult(isValid = true, errors = [], warnings = []) {
  return { isValid, errors, warnings };
}

/**
 * Validate complete address
 * @param {Object} address - { estado, ciudad, colonia, codigoPostal }
 * @returns {Object} { isValid, errors[], warnings[] }
 */
export function validateAddress(address) {
  const errors = [];
  const warnings = [];

  if (!address) {
    return createValidationResult(false, ['Address is required']);
  }

  // Check required fields
  if (!address.estado?.trim()) {
    errors.push('Estado (state) is required');
  }
  if (!address.ciudad?.trim()) {
    errors.push('Ciudad (city) is required');
  }
  if (!address.colonia?.trim()) {
    errors.push('Colonia (neighborhood) is required');
  }

  // Check postal code format (5 digits)
  if (address.codigoPostal) {
    if (!/^\d{5}$/.test(address.codigoPostal.trim())) {
      errors.push('Código Postal must be 5 digits (e.g., 06500)');
    }
  }

  // Validate against known Mexican locations
  if (address.estado?.trim()) {
    const estadoData = findEstadoByName(address.estado);
    if (!estadoData) {
      warnings.push(
        `Estado "${address.estado}" not found in database. Please verify spelling.`
      );
    } else if (address.ciudad?.trim()) {
      // Check if city exists in estado
      const ciudadData = findCiudadByName(estadoData, address.ciudad);
      if (!ciudadData) {
        warnings.push(
          `Ciudad "${address.ciudad}" not found in ${address.estado}. Please verify.`
        );
      } else if (address.colonia?.trim()) {
        // Check if colonia exists in city
        const coloniaExists = ciudadData.colonias.some(
          c => c.toLowerCase() === address.colonia.trim().toLowerCase()
        );
        if (!coloniaExists) {
          warnings.push(
            `Colonia "${address.colonia}" not found in ${address.ciudad}. Please verify.`
          );
        }
      }
    }
  }

  // Check for common typos
  const typoWarnings = detectCommonTypos(address);
  warnings.push(...typoWarnings);

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * Validate individual field
 * @param {string} field - Field name: 'estado', 'ciudad', 'colonia', 'codigoPostal'
 * @param {string} value - Value to validate
 * @returns {Object} { isValid, errors[], warnings[] }
 */
export function validateField(field, value) {
  const errors = [];
  const warnings = [];

  if (!value?.trim()) {
    if (field === 'codigoPostal') {
      warnings.push('Postal code is optional');
    } else {
      errors.push(`${field} is required`);
    }
    return createValidationResult(field === 'codigoPostal', errors, warnings);
  }

  switch (field) {
    case 'estado':
      if (!findEstadoByName(value)) {
        warnings.push(`Estado "${value}" not found. Did you mean one of the 31 Mexican states?`);
      }
      break;

    case 'ciudad':
      if (value.length < 2) {
        errors.push('City name is too short');
      }
      break;

    case 'colonia':
      if (value.length < 2) {
        errors.push('Neighborhood name is too short');
      }
      break;

    case 'codigoPostal':
      if (!/^\d{5}$/.test(value.trim())) {
        errors.push('Postal code must be exactly 5 digits');
      }
      break;

    default:
      break;
  }

  return createValidationResult(errors.length === 0, errors, warnings);
}

/**
 * Get list of valid estado names
 * @returns {Array} Estado names
 */
export function getValidEstados() {
  return mexicanLocations.estados.map(e => e.nombre);
}

/**
 * Get cities for a specific estado
 * @param {string} estadoName - Name of estado
 * @returns {Array} City names
 */
export function getCitiesForEstado(estadoName) {
  const estado = findEstadoByName(estadoName);
  return estado ? estado.ciudades.map(c => c.nombre) : [];
}

/**
 * Get colonias for a specific city
 * @param {string} estadoName - Name of estado
 * @param {string} ciudadName - Name of ciudad
 * @returns {Array} Colonia names
 */
export function getColoniasForCity(estadoName, ciudadName) {
  const estado = findEstadoByName(estadoName);
  if (!estado) return [];

  const ciudad = findCiudadByName(estado, ciudadName);
  return ciudad ? ciudad.colonias : [];
}

/**
 * Helper: Find estado by name (case-insensitive)
 */
function findEstadoByName(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  return mexicanLocations.estados.find(
    e => e.nombre.toLowerCase() === normalized
  );
}

/**
 * Helper: Find ciudad by name
 */
function findCiudadByName(estado, name) {
  if (!estado || !name) return null;
  const normalized = name.toLowerCase().trim();
  return estado.ciudades.find(
    c => c.nombre.toLowerCase() === normalized
  );
}

/**
 * Helper: Detect common address typos
 */
function detectCommonTypos(address) {
  const warnings = [];
  const commonTypos = {
    'Ciudad de Mexico': 'Ciudad de México',
    'Mexico': 'México',
    'Guadalajara': 'Guadalajara',
    'Queretaro': 'Querétaro',
    'San Jose': 'San José',
  };

  Object.entries(commonTypos).forEach(([typo, correct]) => {
    if (
      address.estado?.toLowerCase().includes(typo.toLowerCase()) ||
      address.ciudad?.toLowerCase().includes(typo.toLowerCase())
    ) {
      warnings.push(`Did you mean "${correct}"?`);
    }
  });

  return warnings;
}

/**
 * Format address for display
 * @param {Object} address
 * @returns {string} Formatted address
 */
export function formatAddress(address) {
  if (!address) return '';
  const parts = [
    address.colonia,
    address.ciudad,
    address.estado,
    address.codigoPostal,
  ].filter(Boolean);
  return parts.join(', ');
}
