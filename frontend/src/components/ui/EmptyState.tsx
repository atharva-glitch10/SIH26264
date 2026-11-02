import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** @deprecated Legacy icon slot; ignored by the current design. */
  icon?: unknown;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12px] text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
