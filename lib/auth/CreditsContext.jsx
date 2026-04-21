'use client';

/**
 * Credits Context
 * Tracks the authenticated user's credit balance and exposes helpers to spend / buy.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as creditsAPI from '@/lib/api/credits';
import { AuthContext } from './AuthContext';

export const CreditsContext = createContext({ balance: 0, refresh: () => {} });

export function CreditsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setBalance(0); return; }
    try {
      setLoading(true);
      const data = await creditsAPI.getBalance();
      setBalance(data.balance ?? 0);
    } catch {
      // silently fail — not fatal
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh whenever the authenticated user changes
  useEffect(() => { refresh(); }, [refresh]);

  /**
   * Spend 1 credit to unlock a lead's contact info. Refreshes balance on success.
   * @param {string} leadId
   * @param {'application'|'request'} leadType
   */
  const spend = useCallback(async (leadId, leadType) => {
    const result = await creditsAPI.spendCredit(leadId, leadType);
    if (result.success) setBalance(result.newBalance);
    return result;
  }, []);

  return (
    <CreditsContext.Provider value={{ balance, loading, refresh, spend }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
