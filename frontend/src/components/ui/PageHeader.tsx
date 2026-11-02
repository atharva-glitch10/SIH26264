import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-2 text-xs font-medium text-slate-500">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <div className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
