"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Plus } from "lucide-react";
import { saveBudgetAction } from "@/app/actions/budgets";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useToast } from "@/components/ui/toast";
import { centsToInput, currencyInfo, parseAmountToCents } from "@/lib/money";
import { monthLabel } from "@/lib/date";
import type { Budget, Category } from "@/lib/types";

export function BudgetDialog({
  month,
  categories,
  budgets,
  budget,
  defaultCategoryId,
  triggerLabel,
  triggerStyle = "default",
  renderTrigger,
  currency,
}: {
  month: string;
  categories: Category[];
  budgets: Budget[];
  budget?: Budget;
  defaultCategoryId?: string | null;
  triggerLabel?: string;
  triggerStyle?: "default" | "dashed";
  renderTrigger?: (open: () => void) => ReactNode;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(budget ? budget.categoryId ?? "" : defaultCategoryId ?? "");
  const [amount, setAmount] = useState(budget ? centsToInput(budget.amountCents) : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const monthBudgets = budgets.filter((b) => b.month.slice(0, 7) === month.slice(0, 7));
  const available = categories.filter(
    (category) =>
      category.type === "expense" &&
      (!monthBudgets.some((b) => b.categoryId === category.id) || category.id === budget?.categoryId),
  );
  const overallTaken = monthBudgets.some((b) => b.categoryId === null) && budget?.categoryId !== null;
  const isEditing = Boolean(budget);

  useEffect(() => {
    if (!open) return;
    setCategoryId(budget ? budget.categoryId ?? "" : defaultCategoryId ?? "");
    setAmount(budget ? centsToInput(budget.amountCents) : "");
    setError(null);
  }, [open, budget, defaultCategoryId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (parseAmountToCents(amount) === null) {
      setError("Укажите сумму бюджета больше нуля");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("month", month);
      formData.set("categoryId", categoryId);
      formData.set("amount", amount);
      const result = await saveBudgetAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить бюджет");
        return;
      }
      toast(result.message ?? "Бюджет сохранён");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Не удалось сохранить бюджет. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  const symbol = currencyInfo(currency).symbol;
  const selected = categories.find((c) => c.id === categoryId);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : triggerStyle === "dashed" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-2.5 text-[12px] font-medium text-muted transition-colors hover:border-brand/40 hover:text-brand-strong"
        >
          <Plus size={14} /> {triggerLabel ?? "Добавить лимит по категории"}
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} size={isEditing ? "sm" : "md"} variant={isEditing ? "outline" : "primary"}>
          <Wallet size={15} /> {triggerLabel ?? (isEditing ? "Изменить" : "Добавить бюджет")}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditing ? "Изменить бюджет" : "Новый бюджет"}
        description={`${monthLabel(month)} · лимит на расходы`}
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="budget-category">На что</Label>
            <Select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isEditing}
            >
              {!overallTaken || budget?.categoryId === null ? <option value="">Общий бюджет на месяц</option> : null}
              {available.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {isEditing ? <p className="mt-1.5 text-[10px] text-muted">Категорию бюджета нельзя изменить — создайте новый.</p> : null}
          </div>

          <div>
            <Label htmlFor="budget-amount" hint="В месяц">
              Лимит
            </Label>
            <div className="relative">
              <Input
                id="budget-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="30 000"
                className="h-12 pr-10 text-[18px] font-semibold tabular"
                autoFocus
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">{symbol}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3">
            {selected ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${selected.color}18`, color: selected.color }}>
                <CategoryIcon name={selected.icon} size={16} />
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
                <Wallet size={16} />
              </span>
            )}
            <div>
              <p className="text-[12px] font-medium text-ink">{selected?.name ?? "Общий бюджет"}</p>
              <p className="text-[10px] text-muted">
                {selected ? "Лимит только для этой категории" : "Лимит на все расходы месяца"}
              </p>
            </div>
          </div>

          <FieldError>{error}</FieldError>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? "Сохранить" : "Создать бюджет"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
