import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const control =
  "w-full rounded-sm border bg-surface px-3 text-base text-ink placeholder:text-muted " +
  "transition-colors duration-150 hover:border-ink/60 disabled:cursor-not-allowed disabled:bg-page disabled:opacity-60";
const normal = "border-border-strong";
const invalid = "border-danger";

interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string;
}

/** Label + control + hint/error, wired together for screen readers. */
function Shell({ label, hint, error, id, children }: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const aria = (id: string, error?: string, hint?: ReactNode) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error || hint ? `${id}-msg` : undefined,
});

export function Input({ label, hint, error, className, ...rest }: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Shell label={label} hint={hint} error={error} id={id}>
      <input {...aria(id, error, hint)} className={cn(control, "h-10", error ? invalid : normal, className)} {...rest} />
    </Shell>
  );
}

export function Select({ label, hint, error, className, children, ...rest }: FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell label={label} hint={hint} error={error} id={id}>
      <select {...aria(id, error, hint)} className={cn(control, "h-10", error ? invalid : normal, className)} {...rest}>
        {children}
      </select>
    </Shell>
  );
}

export function Textarea({ label, hint, error, className, ...rest }: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell label={label} hint={hint} error={error} id={id}>
      <textarea {...aria(id, error, hint)} className={cn(control, "py-2", error ? invalid : normal, className)} {...rest} />
    </Shell>
  );
}
