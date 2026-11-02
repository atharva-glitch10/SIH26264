import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

<<<<<<< HEAD
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
=======
type Align = "left" | "right";

const alignClass = (align: Align) => (align === "right" ? "text-right" : "text-left");

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full border-collapse text-[13px]", className)} {...rest} />;
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-page", className)} {...rest} />;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
}

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function Th({ align = "left", className, ...rest }: ThProps) {
  return (
    <th
      className={cn(
<<<<<<< HEAD
        "border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none",
=======
        "border-b border-line bg-page px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted",
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
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
=======
  return <td className={cn("border-b border-line px-3 py-2.5", alignClass(align), className)} {...rest} />;
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-brand-soft/40", className)} {...rest} />;
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
}
