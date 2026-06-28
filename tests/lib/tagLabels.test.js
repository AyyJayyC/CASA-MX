import { describe, it, expect } from 'vitest';
import { TAG_LABELS, getTagLabel } from '../../lib/constants/tagLabels';

describe('TAG_LABELS', () => {
  it('contains all expected categories', () => {
    expect(Object.keys(TAG_LABELS)).toEqual([
      'perfil',
      'enfoque',
      'operacion',
      'zona',
      'actividad',
    ]);
  });

  it('has non-empty values for perfil', () => {
    expect(Object.keys(TAG_LABELS.perfil).length).toBeGreaterThan(0);
    expect(TAG_LABELS.perfil.flipper).toBe('Flipper');
  });

  it('has non-empty values for enfoque', () => {
    expect(TAG_LABELS.enfoque.residencial).toBe('Residencial');
    expect(TAG_LABELS.enfoque.comercial).toBe('Comercial');
  });

  it('has non-empty values for operacion', () => {
    expect(TAG_LABELS.operacion.cash).toBe('Contado');
    expect(TAG_LABELS.operacion.infonavit).toBe('INFONAVIT');
  });

  it('has non-empty values for zona', () => {
    expect(TAG_LABELS.zona.norte).toBe('Norte');
    expect(TAG_LABELS.zona.todo_mexico).toBe('Todo México');
  });

  it('has non-empty values for actividad', () => {
    expect(TAG_LABELS.actividad.principiante).toBe('Principiante');
    expect(TAG_LABELS.actividad.profesional).toBe('Profesional');
  });
});

describe('getTagLabel', () => {
  it('returns human-readable label for known perfil key', () => {
    expect(getTagLabel('flipper')).toBe('Flipper');
    expect(getTagLabel('buy_hold')).toBe('Buy & Hold');
  });

  it('returns human-readable label for known enfoque key', () => {
    expect(getTagLabel('residencial')).toBe('Residencial');
  });

  it('returns human-readable label for known operacion key', () => {
    expect(getTagLabel('cash')).toBe('Contado');
    expect(getTagLabel('subject_to')).toBe('Sujeto a');
  });

  it('returns human-readable label for known zona key', () => {
    expect(getTagLabel('norte')).toBe('Norte');
    expect(getTagLabel('todo_mexico')).toBe('Todo México');
  });

  it('returns human-readable label for known actividad key', () => {
    expect(getTagLabel('intermedio')).toBe('Intermedio');
  });

  it('returns the value itself when key is unknown', () => {
    expect(getTagLabel('nonexistent_key')).toBe('nonexistent_key');
  });

  it('returns the value for empty string', () => {
    expect(getTagLabel('')).toBe('');
  });

  it('returns the value for null/undefined (as stringified)', () => {
    // getTagLabel doesn't guard against non-string; it iterates objects
    // If null is passed, it returns null as-is (no match found)
    expect(getTagLabel(null)).toBe(null);
  });
});
