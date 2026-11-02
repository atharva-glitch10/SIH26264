import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

<<<<<<< HEAD
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
=======
// Every tone keeps >= 4.5:1 text contrast on its own background.
const tones: Record<BadgeTone, string> = {
  neutral: "bg-page text-muted border-border-strong/40",
  brand: "bg-brand-soft text-brand border-brand/20",
  accent: "bg-accent-soft text-accent-ink border-accent/50",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  info: "bg-info/10 text-info border-info/30",
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
<<<<<<< HEAD
  dot?: boolean;
}

export default function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none tracking-tight",
=======
}

export default function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        tones[tone],
        className,
      )}
      {...rest}
<<<<<<< HEAD
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[tone])} />}
      {children}
    </span>
=======
    />
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
  );
}
