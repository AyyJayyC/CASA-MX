import { vi } from 'vitest';

vi.mock('@/lib/api/properties', () => ({
  getProperties: vi.fn(),
  getPropertyById: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProperties, useProperty, useInvalidateProperties } from '@/lib/queries/properties';
import * as propertiesAPI from '@/lib/api/properties';

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

describe('properties queries', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('useProperties returns paginated data', async () => {
    const items = [{ id: '1', title: 'Casa 1' }, { id: '2', title: 'Casa 2' }];
    propertiesAPI.getProperties.mockResolvedValue(items);
    const { result } = renderHook(() => useProperties({ listingType: 'for_sale' }), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.pages[0]).toEqual(items);
    });
  });

  it('useProperties returns undefined next page when less than 12 items', async () => {
    const items = [{ id: '1' }];
    propertiesAPI.getProperties.mockResolvedValue(items);
    const { result } = renderHook(() => useProperties(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  it('useProperty returns property by id', async () => {
    const prop = { id: 'p1', title: 'Test Property' };
    propertiesAPI.getPropertyById.mockResolvedValue(prop);
    const { result } = renderHook(() => useProperty('p1'), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.id).toBe('p1');
    });
  });

  it('useProperty returns null when id is null', async () => {
    const { result } = renderHook(() => useProperty(null), { wrapper: Wrapper });
    expect(result.current.data).toBeUndefined();
  });

  it('useInvalidateProperties returns function', () => {
    const { result } = renderHook(() => useInvalidateProperties(), { wrapper: Wrapper });
    expect(typeof result.current).toBe('function');
  });
});
