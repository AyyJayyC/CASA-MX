import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Table({ children, className }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: Props) {
  return (
    <thead
      className={clsx(
        "border-b border-sand-200 text-left text-ink-muted",
        className,
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: Props) {
  return <tbody className={clsx("divide-y divide-sand-200", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: Props) {
  return (
    <tr className={clsx("transition-colors hover:bg-sand-50", className)}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className }: Props) {
  return (
    <th
      scope="col"
      className={clsx("px-3 py-3 text-xs font-semibold uppercase tracking-wide", className)}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: Props) {
  return <td className={clsx("px-3 py-3 text-ink", className)}>{children}</td>;
}
