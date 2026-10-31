import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
  /** @deprecated Legacy alias of `width`. */
  size?: "md" | "lg";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[90vh] w-full flex-col rounded-md border border-line bg-white shadow-lg outline-none",
          resolved === "lg" ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-[12px] font-medium text-muted hover:bg-page hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className={cn("overflow-y-auto text-sm text-ink", !flush && "p-4")}>{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
