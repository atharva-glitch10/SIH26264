import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border border-border bg-surface shadow-card", className)} {...rest} />;
}

interface CardHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, actions, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-border px-4 py-3", className)}>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...rest} />;
}
