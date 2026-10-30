import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * primary   – navy, the default confirm action
 * cta       – saffron fill with dark text; the single most important action on a screen
 * secondary – outlined; ghost – quiet; danger – destructive
 */
type Variant = "primary" | "cta" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-hover border border-transparent",
  cta: "bg-accent text-ink hover:bg-accent-hover active:bg-accent-hover border border-transparent shadow-sm",
  secondary: "bg-surface text-ink border border-border-strong hover:bg-page active:bg-brand-soft",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-brand-soft active:bg-brand-soft",
  danger: "bg-danger text-white border border-transparent hover:opacity-90 active:opacity-100",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
