import * as reviews from '@/lib/reviews';

describe('reviews lib', () => {
  describe('getRoleLabel', () => {
    it('returns spanish label for known roles', () => {
      expect(reviews.getRoleLabel('seller')).toBe('Vendedor');
      expect(reviews.getRoleLabel('buyer')).toBe('Comprador');
      expect(reviews.getRoleLabel('wholesaler')).toBe('Mayorista');
      expect(reviews.getRoleLabel('admin')).toBe('Administrador');
      expect(reviews.getRoleLabel('tenant')).toBe('Inquilino');
      expect(reviews.getRoleLabel('landlord')).toBe('Arrendador');
    });

    it('returns original role for unknown roles', () => {
      expect(reviews.getRoleLabel('unknown')).toBe('unknown');
    });

    it('returns undefined for undefined', () => {
      expect(reviews.getRoleLabel()).toBeUndefined();
    });
  });

  describe('hasApprovedRole', () => {
    it('returns true when user has approved role', () => {
      const user = { roles: [{ type: 'seller', status: 'approved' }] };
      expect(reviews.hasApprovedRole(user, 'seller')).toBe(true);
    });

    it('returns false when user has pending role', () => {
      const user = { roles: [{ type: 'seller', status: 'pending' }] };
      expect(reviews.hasApprovedRole(user, 'seller')).toBe(false);
    });

    it('returns false when user has rejected role', () => {
      const user = { roles: [{ type: 'seller', status: 'rejected' }] };
      expect(reviews.hasApprovedRole(user, 'seller')).toBe(false);
    });

    it('returns false when user does not have role', () => {
      const user = { roles: [{ type: 'buyer', status: 'approved' }] };
      expect(reviews.hasApprovedRole(user, 'seller')).toBe(false);
    });

    it('returns false for null user', () => {
      expect(reviews.hasApprovedRole(null, 'seller')).toBe(false);
    });

    it('returns false for undefined user', () => {
      expect(reviews.hasApprovedRole(undefined, 'seller')).toBe(false);
    });
  });

  describe('constants', () => {
    it('REVIEW_ROLE_LABELS has 6 entries', () => {
      const keys = Object.keys(reviews.REVIEW_ROLE_LABELS);
      expect(keys).toHaveLength(6);
    });

    it('REVIEWEE_ROLE_BY_REVIEWER_ROLE maps correctly', () => {
      expect(reviews.REVIEWEE_ROLE_BY_REVIEWER_ROLE.tenant).toBe('landlord');
      expect(reviews.REVIEWEE_ROLE_BY_REVIEWER_ROLE.landlord).toBe('tenant');
    });
  });
});
