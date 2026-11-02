import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  description = "We could not load this. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
