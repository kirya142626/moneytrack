"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { createGoalAction, updateGoalAction } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { centsToInput, currencyInfo, parseAmountToCents } from "@/lib/money";
import { GOAL_COLORS } from "@/lib/categories";
import type { Goal } from "@/lib/types";

export function GoalDialog({
  goal,
  currency,
  renderTrigger,
}: {
  goal?: Goal;
  currency: string;
  renderTrigger?: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? centsToInput(goal.targetCents) : "");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [note, setNote] = useState(goal?.note ?? "");
  const [color, setColor] = useState(goal?.color ?? GOAL_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setName(goal?.name ?? "");
    setTarget(goal ? centsToInput(goal.targetCents) : "");
    setTargetDate(goal?.targetDate ?? "");
    setNote(goal?.note ?? "");
    setColor(goal?.color ?? GOAL_COLORS[0]);
    setError(null);
  }, [open, goal]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (parseAmountToCents(target) === null) {
      setError("Укажите сумму цели больше нуля");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("target", target);
      formData.set("targetDate", targetDate);
      formData.set("note", note);
      formData.set("color", color);
      if (goal) formData.set("id", goal.id);
      const result = goal ? await updateGoalAction(formData) : await createGoalAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить цель");
        return;
      }
      toast(result.message ?? "Цель сохранена");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Не удалось сохранить цель. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  const symbol = currencyInfo(currency).symbol;

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Target size={15} /> {goal ? "Изменить" : "Создать цель"}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={goal ? "Редактировать цель" : "Новая цель"}
        description="Название, сумма и желаемая дата. Накопления добавляются отдельно."
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="goal-name">Название</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, отпуск"
              maxLength={60}
              autoFocus
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="goal-target">Нужная сумма</Label>
              <div className="relative">
                <Input
                  id="goal-target"
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="200 000"
                  className="pr-9 tabular"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">{symbol}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="goal-date" hint="Необязательно">
                К дате
              </Label>
              <Input
                id="goal-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Цвет</Label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className="h-7 w-7 rounded-full ring-offset-2 ring-offset-[var(--mt-raised)] transition-shadow"
                  style={{
                    backgroundColor: value,
                    boxShadow: color === value ? `0 0 0 2px var(--mt-raised), 0 0 0 4px ${value}` : undefined,
                  }}
                  aria-label={`Цвет ${value}`}
                  aria-pressed={color === value}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="goal-note" hint="Необязательно">
              Заметка
            </Label>
            <Textarea
              id="goal-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Зачем эта цель и что важно помнить"
              maxLength={300}
              className="min-h-[64px]"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <p className="text-[12px] text-ink-soft">{name.trim() || "Новая цель"}</p>
            <p className="ml-auto text-[11px] text-muted tabular">
              {target ? `${target} ${symbol}` : "Сумма не указана"}
            </p>
          </div>

          <FieldError>{error}</FieldError>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={loading}>
              {goal ? "Сохранить" : "Создать цель"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
