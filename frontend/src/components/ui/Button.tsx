import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-xs active:bg-slate-950",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-xs active:bg-slate-100",
  ghost: "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent active:bg-slate-200/60",
  danger: "bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 shadow-xs active:bg-rose-800",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-[13px] gap-2",
};

/** `cta` is a legacy alias of `primary`, kept for backward compatibility. */
type LegacyVariant = "cta";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | LegacyVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const resolved: ButtonVariant = variant === "cta" ? "primary" : variant;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        variants[resolved],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
