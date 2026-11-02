import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const control =
  "w-full rounded-lg border bg-white px-3 text-[13px] text-slate-900 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-xs " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60";
const normal = "border-slate-200 hover:border-slate-300";
const invalid = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15";

interface FieldShellProps {
  label: string;
  hint?: ReactNode;
  error?: string;
}

/** Label + control + hint/error, wired together for screen readers. */
function Shell({ label, hint, error, id, children }: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1 text-xs text-slate-500">{hint}</p>
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
      <input {...aria(id, error, hint)} className={cn(control, "h-9", error ? invalid : normal, className)} {...rest} />
    </Shell>
  );
}

export function Select({ label, hint, error, className, children, ...rest }: FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell label={label} hint={hint} error={error} id={id}>
      <select {...aria(id, error, hint)} className={cn(control, "h-9 cursor-pointer", error ? invalid : normal, className)} {...rest}>
        {children}
      </select>
    </Shell>
  );
}

export function Textarea({ label, hint, error, className, ...rest }: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell label={label} hint={hint} error={error} id={id}>
      <textarea {...aria(id, error, hint)} className={cn(control, "py-2 min-h-[80px]", error ? invalid : normal, className)} {...rest} />
    </Shell>
  );
}
