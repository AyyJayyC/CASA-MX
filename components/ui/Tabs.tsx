"use client";

import clsx from "clsx";
import { useId, useRef } from "react";
import type { ReactNode } from "react";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export function Tabs({
  value,
  onValueChange,
  items,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
  className?: string;
}) {
  const baseId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = items.find((item) => item.value === value) ?? items[0];

  const move = (index: number) => {
    const next = items[index];
    if (!next) return;
    onValueChange(next.value);
    refs.current[next.value]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-sand-200">
        {items.map((item, index) => {
          const selected = item.value === active?.value;
          return (
            <button
              key={item.value}
              ref={(element) => {
                refs.current[item.value] = element;
              }}
              id={`${baseId}-tab-${item.value}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  move((index + 1) % items.length);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  move((index - 1 + items.length) % items.length);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  move(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  move(items.length - 1);
                }
              }}
              className={clsx(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-clay text-clay"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active.value}`}
          aria-labelledby={`${baseId}-tab-${active.value}`}
          tabIndex={0}
          className="pt-4"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
