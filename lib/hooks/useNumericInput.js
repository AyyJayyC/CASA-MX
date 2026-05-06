'use client';

import { useEffect, useState } from 'react';

function toDisplayValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }

  return String(value);
}

function sanitizeNumericText(rawValue, integerOnly) {
  const text = String(rawValue || '');
  if (integerOnly) {
    return text.replace(/\D+/g, '');
  }

  const normalized = text.replace(/[^\d.]+/g, '');
  const parts = normalized.split('.');
  return parts.length <= 1 ? normalized : `${parts[0]}.${parts.slice(1).join('')}`;
}

export default function useNumericInput({
  value,
  onValueChange,
  min = 0,
  max,
  integerOnly = true,
} = {}) {
  const [displayValue, setDisplayValue] = useState(toDisplayValue(value));

  useEffect(() => {
    setDisplayValue(toDisplayValue(value));
  }, [value]);

  const commitValue = (nextText) => {
    if (nextText === '') {
      onValueChange?.(undefined);
      return undefined;
    }

    const parsedValue = integerOnly ? Number.parseInt(nextText, 10) : Number.parseFloat(nextText);
    if (!Number.isFinite(parsedValue)) {
      onValueChange?.(undefined);
      return undefined;
    }

    let normalizedValue = parsedValue;
    if (typeof min === 'number') {
      normalizedValue = Math.max(min, normalizedValue);
    }
    if (typeof max === 'number') {
      normalizedValue = Math.min(max, normalizedValue);
    }

    onValueChange?.(normalizedValue);
    return normalizedValue;
  };

  return {
    value: displayValue,
    handlers: {
      onFocus: () => {
        if (displayValue === '' || displayValue === '0') {
          setDisplayValue('');
        }
      },
      onChange: (event) => {
        const sanitized = sanitizeNumericText(event.target.value, integerOnly);
        setDisplayValue(sanitized);
        commitValue(sanitized);
      },
      onBlur: () => {
        if (displayValue === '') {
          setDisplayValue('0');
          onValueChange?.(0);
          return;
        }

        const nextValue = commitValue(displayValue);
        setDisplayValue(toDisplayValue(nextValue ?? 0));
      },
    },
  };
}