import type { ReactNode } from "react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  helper?: ReactNode;
}

export default function StatCard({ label, value, delta, helper }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-ink">{value}</span>
        {delta && <span className="text-sm text-muted">{delta}</span>}
      </div>
      {helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </Card>
  );
}
