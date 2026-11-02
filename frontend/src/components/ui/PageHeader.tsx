import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
<<<<<<< HEAD
=======
  /** ReactNode so pages can pass status tags alongside the text. */
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
<<<<<<< HEAD
    <div className="mb-6">
      {breadcrumb && <div className="mb-2 text-xs font-medium text-slate-500">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <div className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
=======
    <div className="mb-5">
      {breadcrumb && <div className="mb-2 text-[12px] text-muted">{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          {description && <div className="mt-1 text-sm text-muted">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      </div>
    </div>
  );
}

export default PageHeader;
