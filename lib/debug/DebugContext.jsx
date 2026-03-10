/**
 * Debug Context - React Context for managing debug session and logging
 * Purpose: Provide debug functionality across entire frontend
 * Checkpoint 3: Frontend Action & Error Logging
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DebugContext = createContext(null);

export function DebugProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check localStorage for existing session
        let existingSessionId = localStorage.getItem('debug_session_id');

        if (!existingSessionId) {
          // Create new session
          try {
            const response = await fetch('http://localhost:3001/debug/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userAgent: navigator.userAgent,
                initialRoute: window.location.pathname
              })
            });

            if (response.ok) {
              const data = await response.json();
              existingSessionId = data.id;

              if (existingSessionId && existingSessionId !== 'error') {
                localStorage.setItem('debug_session_id', existingSessionId);
              }
            }
          } catch (err) {
            console.debug('Failed to create debug session:', err.message);
          }
        }

        setSessionId(existingSessionId);
      } catch (error) {
        console.debug('Debug session init failed:', error.message);
      }
    };

    initSession();
  }, []);

  const logAction = useCallback(
    async (actionType, actionName, metadata = null) => {
      if (!isEnabled || !sessionId) return;

      try {
        await fetch('http://localhost:3001/debug/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            actionType,
            actionName,
            currentRoute: window.location.pathname,
            metadata
          })
        });
      } catch (err) {
        // Silently fail
        console.debug('Failed to log action:', err.message);
      }
    },
    [sessionId, isEnabled]
  );

  const logError = useCallback(
    async (error, componentName = null, context = null) => {
      if (!isEnabled || !sessionId) return;

      try {
        await fetch('http://localhost:3001/debug/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            errorMessage: error?.message || String(error),
            errorStackTrace: error?.stack,
            errorType: 'frontend',
            severity: 'medium',
            componentName,
            currentRoute: window.location.pathname,
            contextData: context
          })
        });
      } catch (err) {
        // Silently fail
        console.debug('Failed to log error:', err.message);
      }
    },
    [sessionId, isEnabled]
  );

  const toggleLogging = useCallback((enabled) => {
    setIsEnabled(enabled);
  }, []);

  const value = {
    sessionId,
    isEnabled,
    logAction,
    logError,
    toggleLogging
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    // Return dummy functions if not wrapped in provider
    return {
      sessionId: null,
      isEnabled: false,
      logAction: () => {},
      logError: () => {},
      toggleLogging: () => {}
    };
  }
  return context;
}

export default DebugContext;
