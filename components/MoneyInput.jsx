'use client';

import { useRef, useCallback } from 'react';

function parseRaw(text) {
  return String(text || '').replace(/\D/g, '');
}

function formatDisplay(raw) {
  if (!raw || raw === '0') return '';
  return Number(raw).toLocaleString('es-MX');
}

/**
 * Controlled input that displays thousand-separator formatting (1,500,000)
 * while storing the raw integer value for form submission.
 */
export default function MoneyInput({ value, onChange, placeholder, min, className, ...props }) {
  const inputRef = useRef(null);
  const cursorRef = useRef(0);

  const display = typeof value === 'number' && value > 0
    ? value.toLocaleString('es-MX')
    : '';

  const handleChange = useCallback((e) => {
    const input = e.target;
    const cursor = input.selectionStart;
    const oldVal = input.value;
    const oldCommas = (oldVal.slice(0, cursor).match(/,/g) || []).length;

    const raw = parseRaw(input.value);
    const num = raw ? parseInt(raw, 10) : 0;
    const newDisplay = num > 0 ? num.toLocaleString('es-MX') : '';

    cursorRef.current = cursor + ((newDisplay.slice(0, cursor).match(/,/g) || []).length - oldCommas);

    // Fire the onChange with raw number
    onChange?.(num > 0 ? num : undefined);

    // Restore cursor after render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = Math.min(cursorRef.current, newDisplay.length);
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  }, [onChange]);

  const handleFocus = useCallback((e) => {
    // On focus, briefly show raw for easy editing, then restore
    const raw = parseRaw(e.target.value);
    e.target.value = raw || '';
    requestAnimationFrame(() => {
      if (inputRef.current && raw) {
        const pos = raw.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  }, []);

  const handleBlur = useCallback(() => {
    // Re-sync display from parent value
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder || '0'}
      className={className}
      {...props}
    />
  );
}
