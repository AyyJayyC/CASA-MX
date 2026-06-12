import { vi } from 'vitest';

vi.mock('@/lib/api/credits', () => ({
  getBalance: vi.fn(),
  getTransactions: vi.fn(),
  getPackages: vi.fn(),
  spendCredit: vi.fn(),
}));

vi.mock('@/lib/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreditsBalance, useCreditPackages, useSpendCredit, useInvalidateCredits } from '@/lib/queries/credits';
import * as creditsAPI from '@/lib/api/credits';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function Wrapper({ children }) {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
}

describe('credits queries', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('useCreditsBalance returns balance from API', async () => {
    creditsAPI.getBalance.mockResolvedValue({ balance: 50 });
    const { result } = renderHook(() => useCreditsBalance(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toBe(50));
  });

  it('useCreditsBalance defaults to 0 when balance missing', async () => {
    creditsAPI.getBalance.mockResolvedValue({});
    const { result } = renderHook(() => useCreditsBalance(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toBe(0));
  });

  it('useCreditPackages returns data', async () => {
    creditsAPI.getPackages.mockResolvedValue({ data: [{ id: 'p1', credits: 10 }] });
    const { result } = renderHook(() => useCreditPackages(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data.data).toHaveLength(1));
  });

  it('useSpendCredit calls mutation and updates cache', async () => {
    creditsAPI.spendCredit.mockResolvedValue({ success: true, newBalance: 5 });
    queryClient.setQueryData(['credits', 'balance'], { balance: 10 });
    const { result } = renderHook(() => useSpendCredit(), { wrapper: Wrapper });

    await waitFor(() => result.current.mutateAsync({ leadId: 'l1', leadType: 'contact' }));

    const balance = queryClient.getQueryData(['credits', 'balance']);
    expect(balance.balance).toBe(5);
  });

  it('useInvalidateCredits returns invalidation function', () => {
    const { result } = renderHook(() => useInvalidateCredits(), { wrapper: Wrapper });
    expect(typeof result.current).toBe('function');
  });
});
