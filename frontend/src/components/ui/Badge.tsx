import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200/80",
  brand: "bg-blue-50 text-blue-700 border-blue-200/80",
  accent: "bg-amber-50 text-amber-800 border-amber-200/80",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 border-amber-200/80",
  danger: "bg-rose-50 text-rose-700 border-rose-200/80",
  info: "bg-sky-50 text-sky-700 border-sky-200/80",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-slate-400",
  brand: "bg-blue-600",
  accent: "bg-amber-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export default function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[tone])} />}
      {children}
    </span>
  );
}
