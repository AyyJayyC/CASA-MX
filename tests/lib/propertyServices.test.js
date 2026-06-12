import {
  RENTAL_SERVICE_METADATA,
  PROPERTY_AMENITY_CATEGORIES,
  PROPERTY_AMENITY_METADATA,
  SERVICE_LOOKUP,
  AMENITY_LOOKUP,
  getServiceMeta,
  getAmenityMeta,
  groupAmenitiesByCategory,
} from '@/lib/constants/propertyServices';

describe('propertyServices', () => {
  it('RENTAL_SERVICE_METADATA has 8 services', () => {
    expect(RENTAL_SERVICE_METADATA).toHaveLength(8);
  });

  it('PROPERTY_AMENITY_CATEGORIES has 6 categories', () => {
    expect(PROPERTY_AMENITY_CATEGORIES).toHaveLength(6);
  });

  it('PROPERTY_AMENITY_METADATA flattens all items', () => {
    const totalItems = PROPERTY_AMENITY_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
    expect(PROPERTY_AMENITY_METADATA).toHaveLength(totalItems);
  });

  it('SERVICE_LOOKUP maps service value to object', () => {
    const luz = SERVICE_LOOKUP['Luz'];
    expect(luz.label).toBe('Luz (Electricidad)');
    expect(luz.emoji).toBe('💡');
  });

  it('AMENITY_LOOKUP maps amenity value to object', () => {
    const ac = AMENITY_LOOKUP['Aire acondicionado'];
    expect(ac.category).toBe('climate');
    expect(ac.label).toBe('Aire acondicionado');
  });

  it('getServiceMeta returns known service', () => {
    const meta = getServiceMeta('Agua');
    expect(meta.label).toBe('Agua');
    expect(meta.emoji).toBe('💧');
  });

  it('getServiceMeta returns fallback for unknown service', () => {
    const meta = getServiceMeta('Unknown Service');
    expect(meta.value).toBe('Unknown Service');
    expect(meta.emoji).toBe('•');
  });

  it('getAmenityMeta returns known amenity', () => {
    const meta = getAmenityMeta('Refrigerador');
    expect(meta.category).toBe('kitchen');
    expect(meta.label).toBe('Refrigerador');
  });

  it('getAmenityMeta returns fallback for unknown amenity', () => {
    const meta = getAmenityMeta('Fancy Thing');
    expect(meta.value).toBe('Fancy Thing');
    expect(meta.category).toBe('other');
    expect(meta.categoryLabel).toBe('Otros');
  });

  it('groupAmenitiesByCategory groups correctly', () => {
    const groups = groupAmenitiesByCategory(['Refrigerador', 'Estufa', 'Aire acondicionado']);
    const keys = Object.keys(groups);
    expect(keys).toContain('Cocina');
    expect(keys).toContain('Clima');
    expect(groups['Cocina']).toHaveLength(2);
    expect(groups['Clima']).toHaveLength(1);
  });

  it('groupAmenitiesByCategory returns empty for empty array', () => {
    const groups = groupAmenitiesByCategory([]);
    expect(Object.keys(groups)).toHaveLength(0);
  });

  it('PROPERTY_AMENITY_METADATA items have correct category reference', () => {
    for (const amenity of PROPERTY_AMENITY_METADATA) {
      expect(amenity.category).toBeTruthy();
      expect(amenity.categoryLabel).toBeTruthy();
    }
  });
});
