import { act } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

function resetStore() {
  act(() => {
    useUserStore.getState().clearAll();
  });
}

describe('userStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('preferences', () => {
    it('getPreferences returns defaults for client role', () => {
      const prefs = useUserStore.getState().getPreferences('client');
      expect(prefs.propertyTypes).toEqual([]);
      expect(prefs.petFriendly).toBe(false);
      expect(prefs.furnished).toBe('unfurnished');
    });

    it('getPreferences returns defaults for owner role', () => {
      const prefs = useUserStore.getState().getPreferences('owner');
      expect(prefs.estados).toEqual([]);
      expect(prefs.ciudades).toEqual([]);
    });

    it('savePreferences stores and retrieves prefs', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
      });
      const prefs = useUserStore.getState().getPreferences('client');
      expect(prefs.propertyTypes).toEqual(['Casa']);
    });

    it('savePreferences merges with defaults', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
      });
      const prefs = useUserStore.getState().getPreferences('client');
      expect(prefs.petFriendly).toBe(false);
    });
  });

  describe('notifications', () => {
    it('getNotifications returns defaults', () => {
      const notifs = useUserStore.getState().getNotifications();
      expect(notifs.newProperties).toBe(true);
      expect(notifs.frequency).toBe('instant');
    });

    it('saveNotifications stores and retrieves', () => {
      act(() => {
        useUserStore.getState().saveNotifications({ frequency: 'daily' });
      });
      const notifs = useUserStore.getState().getNotifications();
      expect(notifs.frequency).toBe('daily');
    });
  });

  describe('tags', () => {
    it('getTags returns defaults', () => {
      const tags = useUserStore.getState().getTags();
      expect(tags.perfil).toEqual([]);
      expect(tags.enfoque).toEqual([]);
    });

    it('saveTags stores and retrieves', () => {
      act(() => {
        useUserStore.getState().saveTags({ perfil: ['Developer'] });
      });
      const tags = useUserStore.getState().getTags();
      expect(tags.perfil).toEqual(['Developer']);
    });
  });

  describe('addresses', () => {
    it('addAddress stores address', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
      });
      const addresses = useUserStore.getState().addresses;
      expect(addresses).toHaveLength(1);
      expect(addresses[0].ciudad).toBe('Hermosillo');
    });

    it('addAddress deduplicates by normalized fields', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
        useUserStore.getState().addAddress({ ciudad: 'HERMOSILLO', estado: 'sonora', colonia: 'centro' });
      });
      expect(useUserStore.getState().addresses).toHaveLength(1);
    });

    it('addAddress does nothing for null', () => {
      act(() => {
        useUserStore.getState().addAddress(null);
      });
      expect(useUserStore.getState().addresses).toHaveLength(0);
    });

    it('getRecentAddresses returns limited results', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useUserStore.getState().addAddress({ ciudad: `City${i}`, estado: 'Sonora', colonia: `Col${i}` });
        }
      });
      const recent = useUserStore.getState().getRecentAddresses(3);
      expect(recent).toHaveLength(3);
    });

    it('searchAddresses filters by field', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'Hermosillo', estado: 'Sonora', colonia: 'Centro' });
        useUserStore.getState().addAddress({ ciudad: 'Obregon', estado: 'Sonora', colonia: 'Norte' });
      });
      const results = useUserStore.getState().searchAddresses('hermo', 'ciudad');
      expect(results).toHaveLength(1);
    });

    it('searchAddresses returns all with empty query', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'A', estado: 'B', colonia: 'C' });
      });
      const results = useUserStore.getState().searchAddresses('', 'ciudad');
      expect(results).toHaveLength(1);
    });

    it('clearAddresses removes all', () => {
      act(() => {
        useUserStore.getState().addAddress({ ciudad: 'A', estado: 'B', colonia: 'C' });
        useUserStore.getState().clearAddresses();
      });
      expect(useUserStore.getState().addresses).toHaveLength(0);
    });

    it('clearAll resets everything', () => {
      act(() => {
        useUserStore.getState().savePreferences('client', { propertyTypes: ['Casa'] });
        useUserStore.getState().addAddress({ ciudad: 'A', estado: 'B', colonia: 'C' });
        useUserStore.getState().clearAll();
      });
      expect(useUserStore.getState().addresses).toHaveLength(0);
      const prefs = useUserStore.getState().getPreferences();
      expect(prefs.propertyTypes).toEqual([]);
    });
  });
});
