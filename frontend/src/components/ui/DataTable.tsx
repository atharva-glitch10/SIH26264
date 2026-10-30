import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`border-b border-border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted ${className}`}
      {...rest}
    />
  );
}

export function Td({ className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`border-b border-border px-4 py-2.5 text-ink ${className}`} {...rest} />;
}

/** Row with hover highlight (no zebra striping). */
export function Tr({ className = "", ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover:bg-page ${className}`} {...rest} />;
}
