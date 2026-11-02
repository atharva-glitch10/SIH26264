import type { ButtonHTMLAttributes } from "react";
<<<<<<< HEAD
import { Loader2 } from "lucide-react";
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
<<<<<<< HEAD
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
=======
  primary: "bg-brand text-white hover:bg-brand-hover border border-transparent",
  secondary: "bg-white border border-line text-ink hover:bg-page",
  ghost: "text-brand hover:bg-brand-soft border border-transparent",
  danger: "bg-bad text-white hover:bg-bad/90 border border-transparent",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
};

/** `cta` is a legacy alias of `primary`, kept until pages are migrated. */
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
type LegacyVariant = "cta";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | LegacyVariant;
  size?: ButtonSize;
<<<<<<< HEAD
=======
  /** @deprecated Legacy flag; maps to `disabled`. */
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
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
<<<<<<< HEAD
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
=======
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
        variants[resolved],
        sizes[size],
        className,
      )}
      {...rest}
    >
<<<<<<< HEAD
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
=======
>>>>>>> 899c50d0477d5fe78ec9d8460645c73c230fb4b9
      {children}
    </button>
  );
}

export default Button;
