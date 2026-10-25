"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Удалить",
  onConfirm,
  trigger,
  triggerLabel,
  iconOnly = false,
  buttonClassName,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<ActionResult>;
  trigger?: ReactNode;
  triggerLabel?: string;
  iconOnly?: boolean;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (!result.ok) {
        setError(result.error ?? "Не удалось выполнить действие");
        return;
      }
      toast(result.message ?? "Готово");
      setOpen(false);
    } catch {
      setError("Не удалось выполнить действие. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-flex">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={triggerLabel}
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger",
            iconOnly ? "h-8 w-8" : "h-9 gap-1.5 border border-line px-3 text-[13px] font-medium",
            buttonClassName,
          )}
        >
          {triggerLabel}
        </button>
      )}

      <Modal
        open={open}
        onClose={() => (loading ? null : setOpen(false))}
        title={title}
        size="sm"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirm} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <AlertTriangle size={19} />
          </span>
          <p className="pt-1 text-[13px] leading-6 text-muted">{description}</p>
        </div>
        {error ? <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[12px] text-danger">{error}</p> : null}
      </Modal>
    </>
  );
}
