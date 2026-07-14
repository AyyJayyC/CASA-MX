import { act } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

function resetStore() {
  act(() => { useUserStore.getState().clearAll(); });
}

describe('userStore — Production Gate', () => {
  beforeEach(resetStore);

  describe('Address deduplication and limits', () => {
    it('deduplicates addresses case-insensitively by estado+ciudad+colonia', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
        useUserStore.getState().addAddress({ ciudad: 'hermosillo', estado: 'sonora', colonia: 'centro' });
        useUserStore.getState().addAddress({ ciudad: 'HERMOSILLO', estado: 'SONORA', colonia: 'CENTRO' });
      });
      expect(useUserStore.getState().addresses).toHaveLength(1);
    });

    it('keeps distinct cities even in same state', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
        useUserStore.getState().addAddress({ ciudad: 'Obregon', estado: 'Sonora', colonia: 'Norte' });
      });
      expect(useUserStore.getState().addresses).toHaveLength(2);
    });

    it('enforces max address limit of 50', () => {
      act(() => {
        for (let i = 0; i < 60; i++) {
          useUserStore.getState().addAddress({ ciudad: `City${i}`, estado: 'Sonora', colonia: `Col${i}` });
        }
      });
      expect(useUserStore.getState().addresses.length).toBeLessThanOrEqual(50);
    });

    it('most recent address appears first (LIFO)', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'First', estado: 'A', colonia: '1' });
        useUserStore.getState().addAddress({ ciudad: 'Second', estado: 'B', colonia: '2' });
      });
      expect(useUserStore.getState().addresses[0].ciudad).toBe('Second');
    });

    it('re-adding an existing address moves it to top', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'First', estado: 'A', colonia: '1' });
        useUserStore.getState().addAddress({ ciudad: 'Second', estado: 'B', colonia: '2' });
        useUserStore.getState().addAddress({ ciudad: 'First', estado: 'A', colonia: '1' });
      });
      expect(useUserStore.getState().addresses[0].ciudad).toBe('First');
      expect(useUserStore.getState().addresses).toHaveLength(2);
    });
  });

  describe('Preference isolation', () => {
    it('client prefs do not leak into owner prefs', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
        useUserStore.getState().savePreferences('owner', { propertyTypes: ['Terreno'] });
      });
      expect(useUserStore.getState().getPreferences('client').propertyTypes).toEqual(['Casa']);
      expect(useUserStore.getState().getPreferences('owner').propertyTypes).toEqual(['Terreno']);
    });

    it('saving prefs preserves defaults for unspecified fields', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
      });
      const prefs = useUserStore.getState().getPreferences('client');
      expect(prefs.minPrice).toBe('');
      expect(prefs.furnished).toBe('unfurnished');
    });
  });

  describe('Search and retrieval', () => {
    it('searchAddresses returns empty for non-matching query', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
      });
      const results = useUserStore.getState().searchAddresses('Guadalajara', 'ciudad');
      expect(results).toHaveLength(0);
    });

    it('searchAddresses is case-insensitive', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
      });
      const results = useUserStore.getState().searchAddresses('HERMOSILLO', 'ciudad');
      expect(results).toHaveLength(1);
    });

    it('getRecentAddresses defaults to 5', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useUserStore.getState().addAddress({ ciudad: `City${i}`, estado: 'Sonora', colonia: `Col${i}` });
        }
      });
      expect(useUserStore.getState().getRecentAddresses()).toHaveLength(5);
    });

    it('getRecentAddresses respects custom limit', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useUserStore.getState().addAddress({ ciudad: `City${i}`, estado: 'Sonora', colonia: `Col${i}` });
        }
      });
      expect(useUserStore.getState().getRecentAddresses(2)).toHaveLength(2);
    });
  });

  describe('Clear and reset', () => {
    it('clearAddresses removes all addresses but keeps prefs', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
        useUserStore.getState().addAddress({ ciudad: 'A', estado: 'B', colonia: 'C' });
        useUserStore.getState().clearAddresses();
      });
      expect(useUserStore.getState().addresses).toHaveLength(0);
      expect(useUserStore.getState().getPreferences('client').propertyTypes).toEqual(['Casa']);
    });

    it('clearAll wipes everything', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
        useUserStore.getState().saveTags({ perfil: ['test'] });
        useUserStore.getState().addAddress({ ciudad: 'A', estado: 'B', colonia: 'C' });
        useUserStore.getState().clearAll();
      });
      expect(useUserStore.getState().addresses).toHaveLength(0);
      expect(useUserStore.getState().getPreferences('client').propertyTypes).toEqual([]);
      expect(useUserStore.getState().getTags().perfil).toEqual([]);
    });
  });
});
