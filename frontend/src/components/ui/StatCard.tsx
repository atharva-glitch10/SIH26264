import type { ReactNode } from "react";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
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
    </Card>
  );
}

export default StatCard;
