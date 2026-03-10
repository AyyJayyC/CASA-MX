/**
 * Fetch Wrapper - Automatically log all fetch requests
 * Purpose: Transparent wrapper that logs all API calls without changing function signatures
 * Checkpoint 3: Frontend Action & Error Logging
 */

import { logger } from './logger';

// Store original fetch
const originalFetch = typeof window !== 'undefined' ? window.fetch : null;

/**
 * Wrapped fetch with automatic logging
 */
export async function fetchWithLogging(url, options = {}) {
  const method = options.method || 'GET';
  const startTime = Date.now();

  try {
    logger.logAPI(method, url);

    const response = await originalFetch(url, options);
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
 * Setup global fetch wrapping
 */
export function setupGlobalFetchLogging() {
  if (typeof window === 'undefined' || !originalFetch) return;

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

export default { fetchWithLogging, setupGlobalFetchLogging };
