import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/** Loading placeholder. Pass size classes, e.g. <Skeleton className="h-4 w-32" />. */
export default function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-sm bg-border", className)} {...rest} />;
}

export function SkeletonRows({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={i % 2 ? "h-4 w-5/6" : "h-4 w-full"} />
      ))}
    </div>
  );
}
