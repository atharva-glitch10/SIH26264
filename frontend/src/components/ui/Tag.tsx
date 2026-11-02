import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "ok" | "warn" | "bad" | "info";
type LegacyTone = "success" | "warning" | "danger" | "brand" | "accent";

export type TagTone = Tone | LegacyTone;

const tones: Record<Tone, { bg: string; dot: string }> = {
  neutral: { bg: "bg-slate-100/90 text-slate-700 border-slate-200/90", dot: "bg-slate-400" },
  ok: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200/90", dot: "bg-emerald-500" },
  warn: { bg: "bg-amber-50 text-amber-800 border-amber-200/90", dot: "bg-amber-500" },
  bad: { bg: "bg-rose-50 text-rose-700 border-rose-200/90", dot: "bg-rose-500" },
  info: { bg: "bg-sky-50 text-sky-700 border-sky-200/90", dot: "bg-sky-500" },
};

const legacy: Record<LegacyTone, Tone> = {
  success: "ok",
  warning: "warn",
  danger: "bad",
  brand: "info",
  accent: "warn",
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  dot?: boolean;
}

export function Tag({ tone = "neutral", dot = true, className, children, ...rest }: TagProps) {
  const resolved = (legacy as Record<string, Tone>)[tone] ?? (tone as Tone);
  const style = tones[resolved] ?? tones.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none tracking-tight select-none",
        style.bg,
        className
      )}
      {...rest}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />}
      <span>{children}</span>
    </span>
  );
}

export default Tag;
