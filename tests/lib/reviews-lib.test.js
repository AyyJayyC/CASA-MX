import * as reviews from '@/lib/reviews';

describe('reviews lib', () => {
  describe('getRoleLabel', () => {
    it('returns spanish label for known roles', () => {
      expect(reviews.getRoleLabel('client')).toBe('Inquilino/Comprador');
      expect(reviews.getRoleLabel('owner')).toBe('Arrendador/Vendedor');
      expect(reviews.getRoleLabel('agent')).toBe('Agente');
      expect(reviews.getRoleLabel('admin')).toBe('Administrador');
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
      const user = { roles: [{ type: 'owner', status: 'approved' }] };
      expect(reviews.hasApprovedRole(user, 'owner')).toBe(true);
    });

    it('returns false when user has pending role', () => {
      const user = { roles: [{ type: 'owner', status: 'pending' }] };
      expect(reviews.hasApprovedRole(user, 'owner')).toBe(false);
    });

    it('returns false when user has rejected role', () => {
      const user = { roles: [{ type: 'owner', status: 'rejected' }] };
      expect(reviews.hasApprovedRole(user, 'owner')).toBe(false);
    });

    it('returns false when user does not have role', () => {
      const user = { roles: [{ type: 'client', status: 'approved' }] };
      expect(reviews.hasApprovedRole(user, 'owner')).toBe(false);
    });

    it('returns false for null user', () => {
      expect(reviews.hasApprovedRole(null, 'owner')).toBe(false);
    });

    it('returns false for undefined user', () => {
      expect(reviews.hasApprovedRole(undefined, 'owner')).toBe(false);
    });
  });

  describe('constants', () => {
    it('ROLE_LABELS has 4 entries', () => {
      const keys = Object.keys(reviews.ROLE_LABELS);
      expect(keys).toHaveLength(4);
    });
  });
});
