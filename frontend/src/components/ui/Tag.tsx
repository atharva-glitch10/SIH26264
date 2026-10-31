import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "ok" | "warn" | "bad" | "info";
/** Legacy tone names still used by pages; mapped to the current tones. */
type LegacyTone = "success" | "warning" | "danger" | "brand" | "accent";

export type TagTone = Tone | LegacyTone;

const tones: Record<Tone, string> = {
  neutral: "bg-page text-muted border-line",
  ok: "text-ok border-ok/30 bg-ok/5",
  warn: "text-warn border-warn/30 bg-warn/5",
  bad: "text-bad border-bad/30 bg-bad/5",
  info: "text-info border-info/30 bg-info/5",
};

const legacy: Record<LegacyTone, Tone> = {
  success: "ok",
  warning: "warn",
  danger: "bad",
  brand: "neutral",
  accent: "neutral",
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

export function Tag({ tone = "neutral", className, children, ...rest }: TagProps) {
  const resolved = (legacy as Record<string, Tone>)[tone] ?? (tone as Tone);

  return (
    <span
      className={cn("inline-block rounded-sm border px-1.5 py-0.5 text-[11px] font-medium", tones[resolved], className)}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Tag;
