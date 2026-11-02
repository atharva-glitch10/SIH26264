import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg" | "xl";
  /** @deprecated Legacy alias of `width`. */
  size?: "md" | "lg" | "xl";
  /** @deprecated Legacy: removes body padding so content can lay itself out. */
  flush?: boolean;
}

export function Modal({ open, title, onClose, children, footer, width, size, flush = false }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const resolved = width ?? size ?? "md";

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 transition-all"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[90vh] w-full flex-col rounded-2xl border border-slate-200/90 bg-white shadow-modal outline-none animate-in fade-in zoom-in-95 duration-150",
          resolved === "xl" ? "max-w-4xl" : resolved === "lg" ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h2 id={titleId} className="font-heading text-base font-semibold text-slate-900 tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={cn("overflow-y-auto text-sm text-slate-700", !flush && "p-6")}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
