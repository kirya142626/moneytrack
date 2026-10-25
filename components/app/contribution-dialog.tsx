"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addContributionAction } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { currencyInfo, parseAmountToCents } from "@/lib/money";
import { todayISO } from "@/lib/date";
import type { Goal } from "@/lib/types";

export function ContributionDialog({
  goals,
  currency,
  goal,
  triggerLabel,
  triggerStyle = "default",
  renderTrigger,
}: {
  goals: Goal[];
  currency: string;
  goal?: Goal;
  triggerLabel?: string;
  triggerStyle?: "default" | "icon";
  renderTrigger?: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [goalId, setGoalId] = useState(goal?.id ?? goals[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const symbol = currencyInfo(currency).symbol;

  useEffect(() => {
    if (!open) return;
    setGoalId(goal?.id ?? goals[0]?.id ?? "");
    setAmount("");
    setDate(todayISO());
    setNote("");
    setError(null);
  }, [open, goal, goals]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (parseAmountToCents(amount) === null) {
      setError("Укажите сумму накопления больше нуля");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("goalId", goalId);
      formData.set("amount", amount);
      formData.set("occurredOn", date);
      formData.set("note", note);
      const result = await addContributionAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось добавить накопление");
        return;
      }
      toast(result.message ?? "Накопление добавлено");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Не удалось добавить накопление. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : triggerStyle === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-ink"
          aria-label="Добавить накопление"
        >
          <Plus size={15} />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus size={14} /> {triggerLabel ?? "Пополнить"}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Добавить накопление"
        description="Сумма добавится к прогрессу выбранной цели."
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="contrib-goal">Цель</Label>
            <Select
              id="contrib-goal"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              disabled={Boolean(goal)}
              required
            >
              {goals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contrib-amount">Сумма</Label>
              <div className="relative">
                <Input
                  id="contrib-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10 000"
                  className="pr-9 tabular"
                  autoFocus
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">{symbol}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="contrib-date">Дата</Label>
              <Input
                id="contrib-date"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contrib-note" hint="Необязательно">
              Заметка
            </Label>
            <Input
              id="contrib-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например, отложено с зарплаты"
              maxLength={200}
            />
          </div>
          <FieldError>{error}</FieldError>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={loading} disabled={!goalId}>
              Добавить
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
