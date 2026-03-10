/**
 * API Logger Wrapper
 * Wraps fetch calls to automatically log all API interactions
 */

import { logger } from './logger';

/**
 * Enhanced fetch with automatic logging
 */
export async function fetchWithLogging(url, options = {}) {
  const method = options.method || 'GET';
  const startTime = Date.now();

  try {
    logger.logAPI(method, url);

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    logger.logAPI(method, url, response.status, {
      duration: `${duration}ms`,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      logger.logError(
        new Error(`HTTP ${response.status} ${response.statusText}`),
        { url, method, status: response.status }
      );
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logError(error, {
      url,
      method,
      duration: `${duration}ms`,
      type: 'FETCH_ERROR'
    });
    throw error;
  }
}

/**
 * Wrap fetch globally to capture all requests
 */
export function setupGlobalFetchLogging() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;
    const method = config?.method || 'GET';
    const startTime = Date.now();

    return originalFetch.apply(this, args)
      .then(response => {
        const duration = Date.now() - startTime;
        const status = response.status;

        if (status >= 200 && status < 300) {
          logger.logAPI(method, url, status, {
            duration: `${duration}ms`,
            ok: true
          });
        } else {
          logger.logAPI(method, url, status, {
            duration: `${duration}ms`,
            ok: false,
            statusText: response.statusText
          });

          logger.logError(
            new Error(`HTTP ${status}`),
            { url, method, status }
          );
        }

        return response;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        logger.logError(error, {
          url,
          method,
          duration: `${duration}ms`,
          type: 'FETCH_ERROR'
        });
        throw error;
      });
  };
}

/**
 * Log user interactions
 */
export function setupInteractionLogging() {
  if (typeof window === 'undefined') return;

  // Log clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, [role="button"]');
    if (target) {
      const text = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown';
      logger.logAction('CLICK', {
        element: target.tagName,
        text,
        id: target.id,
        className: target.className
      });
    }
  }, true);

  // Log form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    logger.logAction('FORM_SUBMIT', {
      formId: form.id,
      formName: form.name,
      fields: Object.keys(data)
    });
  }, true);

  // Log input changes
  document.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      logger.logAction('INPUT_CHANGE', {
        type: e.target.type,
        name: e.target.name,
        id: e.target.id
      });
    }
  }, true);
}

/**
 * Log page navigation
 */
export function setupNavigationLogging() {
  if (typeof window === 'undefined') return;

  // Log page visibility changes
  document.addEventListener('visibilitychange', () => {
    logger.logAction('VISIBILITY_CHANGE', {
      hidden: document.hidden
    });
  });

  // Log beforeunload
  window.addEventListener('beforeunload', () => {
    logger.logAction('PAGE_UNLOAD', {
      url: window.location.href
    });
  });
}

/**
 * Setup console error/warning capture
 */
export function setupConsoleLogging() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;
  let isLogging = false;

  console.error = function (...args) {
    if (!isLogging) {
      isLogging = true;
      try {
        logger.log('ERROR', 'console.error', args);
      } finally {
        isLogging = false;
      }
    }
    originalError.apply(console, args);
  };

  console.warn = function (...args) {
    if (!isLogging) {
      isLogging = true;
      try {
        logger.log('WARN', 'console.warn', args);
      } finally {
        isLogging = false;
      }
    }
    originalWarn.apply(console, args);
  };
}

export default {
  fetchWithLogging,
  setupGlobalFetchLogging,
  setupInteractionLogging,
  setupNavigationLogging,
  setupConsoleLogging
};
