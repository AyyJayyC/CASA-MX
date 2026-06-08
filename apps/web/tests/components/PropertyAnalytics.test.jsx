import React from 'react';
import { render } from '@testing-library/react';
import PropertyAnalytics from '../../components/analytics/PropertyAnalytics';
import { describe, it, vi } from 'vitest';

const mockTrack = vi.fn();
vi.mock('../../lib/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track: mockTrack }),
  default: () => ({ track: mockTrack })
}));

describe('PropertyAnalytics', () => {
  it('calls track on mount with property id', () => {
    render(<PropertyAnalytics propertyId="p123" />);
    expect(mockTrack).toHaveBeenCalledWith('PropertyViewed', { entityId: 'p123', metadata: { via: 'detail.page' } });
  });
});
