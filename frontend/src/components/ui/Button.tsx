import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
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
type LegacyVariant = "cta";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | LegacyVariant;
  size?: ButtonSize;
  /** @deprecated Legacy flag; maps to `disabled`. */
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
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[resolved],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
