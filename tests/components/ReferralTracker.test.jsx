import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import ReferralTracker from '../../components/ReferralTracker.jsx';

const mockTrackClick = vi.fn();
vi.mock('../../lib/api/referrals', () => ({
  trackReferralClick: (...args) => mockTrackClick(...args),
}));

const STORAGE_KEY_REF = 'casa-mx:1.0.0:referralCode';
const STORAGE_KEY_AGENCY = 'casa-mx:1.0.0:agencyCode';

describe('ReferralTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('stores referralCode in localStorage when ?compartio= is in URL', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/properties/prop-1?compartio=USR001');

    render(<ReferralTracker />);
    expect(localStorage.getItem(STORAGE_KEY_REF)).toBe('"USR001"');
  });

  it('calls trackReferralClick with the correct code and propertyId', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/properties/prop-1?compartio=USR001');

    render(<ReferralTracker />);
    expect(mockTrackClick).toHaveBeenCalledWith({ referralCode: 'USR001', propertyId: 'prop-1' });
  });

  it('stores agencyCode when ?agencia= is in URL', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/register?agencia=AG001');

    render(<ReferralTracker />);
    expect(localStorage.getItem(STORAGE_KEY_AGENCY)).toBe('"AG001"');
  });

  it('extracts propertyId from /properties/:id path', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/properties/prop-123?compartio=USR001');

    render(<ReferralTracker />);
    expect(mockTrackClick).toHaveBeenCalledWith({ referralCode: 'USR001', propertyId: 'prop-123' });
  });

  it('does nothing when no params in URL', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/properties');

    render(<ReferralTracker />);
    expect(localStorage.getItem(STORAGE_KEY_REF)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY_AGENCY)).toBeNull();
    expect(mockTrackClick).not.toHaveBeenCalled();
  });

  it('handles compartio and agencia simultaneously', () => {
    delete window.location;
    window.location = new URL('https://casamx.com/properties/prop-1?compartio=USR001&agencia=AG001');

    render(<ReferralTracker />);
    expect(localStorage.getItem(STORAGE_KEY_REF)).toBe('"USR001"');
    expect(localStorage.getItem(STORAGE_KEY_AGENCY)).toBe('"AG001"');
  });
});
