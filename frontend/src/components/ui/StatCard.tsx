import type { ReactNode } from "react";
import { Card } from "./Card";
<<<<<<< HEAD
import { cn } from "../../lib/cn";
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9

export interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
<<<<<<< HEAD
  tone?: "default" | "bad" | "warn" | "ok";
  delta?: ReactNode;
  icon?: ReactNode;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, { value: string; border: string; glow: string }> = {
  default: {
    value: "text-slate-900",
    border: "border-slate-200/80 hover:border-slate-300",
    glow: "bg-slate-500/10",
  },
  bad: {
    value: "text-rose-600",
    border: "border-rose-200/80 hover:border-rose-300",
    glow: "bg-rose-500/10",
  },
  warn: {
    value: "text-amber-600",
    border: "border-amber-200/80 hover:border-amber-300",
    glow: "bg-amber-500/10",
  },
  ok: {
    value: "text-emerald-600",
    border: "border-emerald-200/80 hover:border-emerald-300",
    glow: "bg-emerald-500/10",
  },
};

export function StatCard({ label, value, helper, tone = "default", delta, icon }: StatCardProps) {
  const currentTone = toneStyles[tone] ?? toneStyles.default;

  return (
    <Card className={cn("p-4 relative overflow-hidden transition-all duration-200 group hover:-translate-y-0.5", currentTone.border)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
        {icon && (
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", currentTone.glow)}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("font-heading text-2xl font-bold tracking-tight", currentTone.value)}>
          {value}
        </span>
        {delta && (
          <span className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {delta}
          </span>
        )}
      </div>
      {helper && <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">{helper}</p>}
=======
  tone?: "default" | "bad" | "warn";
  /** @deprecated Legacy inline emphasis rendered next to the value. */
  delta?: ReactNode;
}

const valueTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-ink",
  bad: "text-bad",
  warn: "text-warn",
};

export function StatCard({ label, value, helper, tone = "default", delta }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-[12px] text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${valueTone[tone]}`}>{value}</span>
        {delta && <span className="text-[12px] text-muted">{delta}</span>}
      </div>
      {helper && <p className="mt-1 text-[12px] text-muted">{helper}</p>}
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
    </Card>
  );
}

export default StatCard;
