'use client';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/lib/auth/AuthContext';
import { useCredits } from '@/lib/auth/CreditsContext';
import CreditPackages from '@/components/CreditPackages';
import * as creditsAPI from '@/lib/api/credits';

export default function CreditsPage() {
  const { user } = useContext(AuthContext);
  const { balance } = useCredits();
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTxLoading(true);
    creditsAPI.getTransactions()
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center text-neutral-600 dark:text-neutral-400">
        <p>Inicia sesión para ver tus créditos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      {/* Balance header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-8 text-white text-center shadow-lg">
        <p className="text-lg font-medium opacity-90">Tu saldo de créditos</p>
        <p className="text-6xl font-black mt-2">{balance}</p>
        <p className="mt-1 opacity-80 text-sm">{balance === 1 ? 'crédito disponible' : 'créditos disponibles'}</p>
      </div>

      {/* Buy packages */}
      <section>
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">Comprar créditos</h2>
        <CreditPackages />
      </section>

      {/* Transaction history */}
      <section>
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">Historial</h2>
        {txLoading ? (
          <p className="text-sm text-neutral-500">Cargando historial...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay transacciones aún.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-sm bg-white dark:bg-neutral-900"
              >
                <div>
                  <p className="font-medium text-neutral-800 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{new Date(tx.createdAt).toLocaleString('es-MX')}</p>
                </div>
                <span className={`font-bold text-base ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
