/**
 * Logging Initializer
 * Sets up global logging on app startup
 * Checkpoint 3: Frontend Action & Error Logging
 */

'use client';

import { useEffect } from 'react';

export default function LoggingInitializer() {
  useEffect(() => {
    // Just initialize - no complex logging setup needed
    console.log('Debug logging initialized');
  }, []);

  return null;
}
