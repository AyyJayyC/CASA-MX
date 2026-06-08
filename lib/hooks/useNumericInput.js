"use client";

import { useEffect, useState } from "react";

function toDisplayValue(value, formatDisplay) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }
  if (formatDisplay) {
    return Number(value).toLocaleString("es-MX");
  }
  return String(value);
}

function sanitizeNumericText(rawValue, integerOnly) {
  const text = String(rawValue || "");
  if (integerOnly) {
    return text.replace(/\D+/g, "");
  }
  const normalized = text.replace(/[^\d.]+/g, "");
  const parts = normalized.split(".");
  return parts.length <= 1
    ? normalized
    : `${parts[0]}.${parts.slice(1).join("")}`;
}

function parseRawNumber(text) {
  return String(text || "").replace(/[^0-9]/g, "");
}

export default function useNumericInput({
  value,
  onValueChange,
  min = 0,
  max,
  integerOnly = true,
  formatDisplay = false,
} = {}) {
  const [displayValue, setDisplayValue] = useState(
    toDisplayValue(value, formatDisplay),
  );

  useEffect(() => {
    setDisplayValue(toDisplayValue(value, formatDisplay));
  }, [value, formatDisplay]);

  const commitValue = (nextText) => {
    if (nextText === "") {
      onValueChange?.(undefined);
      return undefined;
    }

    const parsedValue = integerOnly
      ? Number.parseInt(nextText, 10)
      : Number.parseFloat(nextText);
    if (!Number.isFinite(parsedValue)) {
      onValueChange?.(undefined);
      return undefined;
    }

    let normalizedValue = parsedValue;
    if (typeof min === "number") {
      normalizedValue = Math.max(min, normalizedValue);
    }
    if (typeof max === "number") {
      normalizedValue = Math.min(max, normalizedValue);
    }

    onValueChange?.(normalizedValue);
    return normalizedValue;
  };

  const handlers = formatDisplay
    ? {
        onFocus: () => {
          // Show raw digits while editing
          const raw = parseRawNumber(displayValue);
          const num = raw === "" ? "" : String(parseInt(raw, 10));
          setDisplayValue(num === "0" ? "" : num);
        },
        onChange: (event) => {
          // Strip commas/formatting, keep raw digits
          const raw = parseRawNumber(event.target.value);
          const num = raw === "" ? "" : parseInt(raw, 10);
          // Show formatted as user types
          const formatted =
            num === "" ? "" : Number(num).toLocaleString("es-MX");
          setDisplayValue(formatted);
          commitValue(String(num || ""));
        },
        onBlur: () => {
          if (displayValue === "" || parseRawNumber(displayValue) === "") {
            setDisplayValue("0");
            onValueChange?.(0);
            return;
          }
          const raw = parseRawNumber(displayValue);
          const num = raw === "" ? 0 : parseInt(raw, 10);
          const formatted =
            num === 0 ? "0" : Number(num).toLocaleString("es-MX");
          setDisplayValue(formatted);
          onValueChange?.(num);
        },
      }
    : {
        onFocus: () => {
          if (displayValue === "" || displayValue === "0") {
            setDisplayValue("");
          }
        },
        onChange: (event) => {
          const sanitized = sanitizeNumericText(
            event.target.value,
            integerOnly,
          );
          setDisplayValue(sanitized);
          commitValue(sanitized);
        },
        onBlur: () => {
          if (displayValue === "") {
            setDisplayValue("0");
            onValueChange?.(0);
            return;
          }
          const nextValue = commitValue(displayValue);
          setDisplayValue(toDisplayValue(nextValue ?? 0, false));
        },
      };

  return {
    value: displayValue,
    handlers,
  };
}
