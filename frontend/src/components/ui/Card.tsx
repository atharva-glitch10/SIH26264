import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white shadow-card transition-all duration-200",
        className,
      )}
      {...rest}
    />
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5", className)}>
      <div className="min-w-0">
        <h2 className="font-heading text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...rest} />;
}

export default Card;
