import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Align = "left" | "right";

const alignClass = (align: Align) => (align === "right" ? "text-right" : "text-left");

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full border-collapse text-[13px]", className)} {...rest} />;
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-page", className)} {...rest} />;
}

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Th({ align = "left", className, ...rest }: ThProps) {
  return (
    <th
      className={cn(
        "border-b border-line bg-page px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted",
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
  return <td className={cn("border-b border-line px-3 py-2.5", alignClass(align), className)} {...rest} />;
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-brand-soft/40", className)} {...rest} />;
}
