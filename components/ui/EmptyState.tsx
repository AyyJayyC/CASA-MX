import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "flex flex-col items-center justify-center px-4 py-16 text-center"
      }
    >
      {icon && <div className="mb-4 text-ink-muted">{icon}</div>}
      <h3 className="mb-2 text-xl font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
