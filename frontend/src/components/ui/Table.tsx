import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Align = "left" | "right" | "center";

const alignClass = (align: Align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-[13px] text-slate-700", className)} {...rest} />
    </div>
  );
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-slate-50/80 backdrop-blur-xs", className)} {...rest} />;
}

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Th({ align = "left", className, ...rest }: ThProps) {
  return (
    <th
      className={cn(
        "border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none",
        alignClass(align),
        className,
      )}
      {...rest}
    />
  );
}

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Td({ align = "left", className, ...rest }: TdProps) {
  return (
    <td
      className={cn(
        "border-b border-slate-100 px-4 py-3 text-[13px] align-middle",
        alignClass(align),
        className,
      )}
      {...rest}
    />
  );
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-slate-50/70 transition-colors", className)} {...rest} />;
}
