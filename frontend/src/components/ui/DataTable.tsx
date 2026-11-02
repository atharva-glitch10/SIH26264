import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
<<<<<<< HEAD
import { cn } from "../../lib/cn";

export function Table({ className = "", children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-[13px] text-slate-700", className)} {...rest}>
=======

export function Table({ className = "", children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${className}`} {...rest}>
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        {children}
      </table>
    </div>
  );
}

export function Th({ className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
<<<<<<< HEAD
      className={cn(
        "border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500",
        className
      )}
=======
      className={`border-b border-border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted ${className}`}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      {...rest}
    />
  );
}

export function Td({ className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
<<<<<<< HEAD
  return (
    <td
      className={cn("border-b border-slate-100 px-4 py-3 text-[13px] text-slate-700 align-middle", className)}
      {...rest}
    />
  );
}

export function Tr({ className = "", ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-slate-50/70 transition-colors", className)} {...rest} />;
=======
  return <td className={`border-b border-border px-4 py-2.5 text-ink ${className}`} {...rest} />;
}

/** Row with hover highlight (no zebra striping). */
export function Tr({ className = "", ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover:bg-page ${className}`} {...rest} />;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
}
