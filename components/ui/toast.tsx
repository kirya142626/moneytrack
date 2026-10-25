"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (title: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, tone: ToastTone = "success") => {
      counter += 1;
      const id = counter;
      setItems((current) => [...current.slice(-2), { id, title, tone }]);
      window.setTimeout(() => remove(id), 4600);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3 shadow-lg animate-scale-in"
          >
            <span
              className={cn(
                "mt-0.5 shrink-0",
                item.tone === "success" && "text-brand",
                item.tone === "error" && "text-danger",
                item.tone === "info" && "text-ink-soft",
              )}
            >
              {item.tone === "success" ? (
                <CheckCircle2 size={18} />
              ) : item.tone === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <Info size={18} />
              )}
            </span>
            <p className="flex-1 text-[13px] leading-5 text-ink">{item.title}</p>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="-mr-1 rounded p-0.5 text-muted transition-colors hover:text-ink"
              aria-label="Закрыть уведомление"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
