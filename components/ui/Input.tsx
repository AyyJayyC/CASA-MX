import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={clsx(
        "h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-sand-200 focus-visible:ring-clay",
        className,
      )}
      {...props}
    />
  );
}
