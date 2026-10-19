import clsx from "clsx";
import type { ReactNode } from "react";

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-5",
} as const;

export function Card({
  padding = "md",
  className,
  children,
}: {
  padding?: keyof typeof PADDING;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-sand-200 bg-white",
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
