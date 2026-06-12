import { vi } from 'vitest';

vi.mock('@/lib/api/requests', () => ({
  getMyRequests: vi.fn(),
  getSellerRequests: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMyContactRequests, useSellerContactRequests } from '@/lib/queries/requests';
import * as requestsAPI from '@/lib/api/requests';

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

describe('requests queries', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('useMyContactRequests returns data', async () => {
    requestsAPI.getMyRequests.mockResolvedValue([{ id: 'r1' }]);
    const { result } = renderHook(() => useMyContactRequests(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 'r1' }]);
    });
  });

  it('useSellerContactRequests returns data', async () => {
    requestsAPI.getSellerRequests.mockResolvedValue([{ id: 'r2' }]);
    const { result } = renderHook(() => useSellerContactRequests(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 'r2' }]);
    });
  });
});
