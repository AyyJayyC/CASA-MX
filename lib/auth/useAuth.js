'use client';

/**
 * useAuth Hook
 * Provides access to authentication context throughout the app
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
