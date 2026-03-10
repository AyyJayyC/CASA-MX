/**
 * API Logger Utilities - High-level helpers for common logging scenarios
 * Purpose: Provide simple, consistent logging for common actions
 * Checkpoint 3: Frontend Action & Error Logging
 */

import { logger } from './logger';

/**
 * Log button click
 */
export function logButtonClick(buttonName, metadata = null) {
  logger.logAction('CLICK', `button_click_${buttonName}`, {
    buttonName,
    ...metadata
  });
}

/**
 * Log form submission
 */
export function logFormSubmit(formName, formData = {}, success = true, metadata = null) {
  const sanitized = sanitizeFormData(formData);
  logger.logAction('FORM_SUBMIT', `form_submit_${formName}`, {
    formName,
    success,
    fields: Object.keys(sanitized),
    ...metadata
  });
}

/**
 * Log navigation
 */
export function logNavigation(fromRoute, toRoute, metadata = null) {
  logger.logAction('NAVIGATION', 'page_navigation', {
    fromRoute,
    toRoute,
    ...metadata
  });
}

/**
 * Log API call from frontend
 */
export function logApiCall(method, endpoint, statusCode, duration, metadata = null) {
  logger.logAction('API_CALL', `api_${method.toLowerCase()}_${endpoint}`, {
    method,
    endpoint,
    statusCode,
    duration,
    ...metadata
  });
}

/**
 * Log component mount
 */
export function logComponentMount(componentName, metadata = null) {
  logger.logDebug(`Component mounted: ${componentName}`, { componentName, ...metadata });
}

/**
 * Log component unmount
 */
export function logComponentUnmount(componentName, metadata = null) {
  logger.logDebug(`Component unmounted: ${componentName}`, { componentName, ...metadata });
}

/**
 * Sanitize form data - remove sensitive fields
 */
function sanitizeFormData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'Authorization'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Truncate object for logging
 */
function truncateObject(obj, maxSize = 5120) {
  if (!obj) return obj;
  const str = JSON.stringify(obj);
  if (str.length > maxSize) {
    return {
      ...JSON.parse(str.substring(0, maxSize)),
      '[TRUNCATED]': `Object truncated from ${str.length} bytes`
    };
  }
  return obj;
}

export default {
  logButtonClick,
  logFormSubmit,
  logNavigation,
  logApiCall,
  logComponentMount,
  logComponentUnmount,
  sanitizeFormData,
  truncateObject
};
