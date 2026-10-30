import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

type ToastTone = "success" | "error" | "info";
interface ToastItem { id: number; tone: ToastTone; message: string }

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

const styles: Record<ToastTone, { icon: typeof Info; bar: string; text: string }> = {
  success: { icon: CheckCircle2, bar: "border-l-success", text: "text-success" },
  error: { icon: AlertTriangle, bar: "border-l-danger", text: "text-danger" },
  info: { icon: Info, bar: "border-l-info", text: "text-info" },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = nextId++;
      setItems((l) => [...l, { id, tone, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => {
            const s = styles[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-md border border-l-4 border-border bg-surface p-3 shadow-lg",
                  s.bar,
                )}
              >
                <s.icon className={cn("mt-0.5 h-5 w-5 shrink-0", s.text)} aria-hidden />
                <p className="flex-1 text-sm text-ink">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="rounded-sm p-0.5 text-muted hover:bg-brand-soft hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** const toast = useToast(); toast("Saved", "success") */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
