"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Plus } from "lucide-react";
import { createTransactionAction, updateTransactionAction } from "@/app/actions/transactions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { centsToInput, currencyInfo, parseAmountToCents } from "@/lib/money";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { Category, Transaction, TxType } from "@/lib/types";
import type { ReactNode } from "react";

export function TransactionDialog({
  categories,
  currency,
  transaction,
  defaultType = "expense",
  defaultDate,
  open,
  onOpenChange,
  renderTrigger,
  triggerLabel = "Добавить операцию",
  triggerVariant = "primary",
  triggerSize = "md",
  triggerClassName,
  triggerIconOnly = false,
}: {
  categories: Category[];
  currency: string;
  transaction?: Transaction;
  defaultType?: TxType;
  defaultDate?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderTrigger?: (open: () => void) => ReactNode;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  triggerIconOnly?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const [type, setType] = useState<TxType>(transaction?.type ?? defaultType);
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [amount, setAmount] = useState(transaction ? centsToInput(transaction.amountCents) : "");
  const [date, setDate] = useState(transaction?.occurredOn ?? defaultDate ?? todayISO());
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const filtered = categories.filter((c) => c.type === type);
  const symbol = currencyInfo(currency).symbol;

  function setOpen(next: boolean) {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!isOpen) return;
    setType(transaction?.type ?? defaultType);
    setCategoryId(transaction?.categoryId ?? "");
    setAmount(transaction ? centsToInput(transaction.amountCents) : "");
    setDate(transaction?.occurredOn ?? defaultDate ?? todayISO());
    setDescription(transaction?.description ?? "");
    setError(null);
  }, [isOpen, transaction, defaultType, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    if (!filtered.some((c) => c.id === categoryId)) {
      setCategoryId(filtered[0]?.id ?? "");
    }
  }, [type, isOpen, filtered, categoryId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (parseAmountToCents(amount) === null) {
      setError("Укажите сумму больше нуля, например 1250 или 1250,50");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("amount", amount);
      formData.set("categoryId", categoryId);
      formData.set("occurredOn", date);
      formData.set("description", description);
      if (transaction) formData.set("id", transaction.id);

      const result = transaction
        ? await updateTransactionAction(formData)
        : await createTransactionAction(formData);

      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить операцию");
        return;
      }
      toast(result.message ?? "Операция сохранена");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Не удалось сохранить операцию. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          onClick={() => setOpen(true)}
          aria-label={triggerIconOnly ? triggerLabel : undefined}
        >
          <Plus size={triggerIconOnly ? 18 : 16} />
          {triggerIconOnly ? null : triggerLabel}
        </Button>
      )}

      <Modal
        open={isOpen}
        onClose={() => setOpen(false)}
        title={transaction ? "Редактировать операцию" : "Новая операция"}
        description={transaction ? "Измените данные — баланс и статистика обновятся сразу." : "Доход или расход с категорией и датой."}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors",
                type === "expense" ? "bg-white text-danger shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
              )}
            >
              <ArrowUpRight size={14} /> Расход
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors",
                type === "income" ? "bg-white text-brand-strong shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
              )}
            >
              <ArrowDownLeft size={14} /> Доход
            </button>
          </div>

          <div>
            <Label htmlFor="tx-amount" hint={type === "expense" ? "Расход" : "Доход"}>
              Сумма
            </Label>
            <div className="relative">
              <Input
                id="tx-amount"
                name="amount"
                inputMode="decimal"
                placeholder="0,00"
                className="h-12 pr-10 text-[18px] font-semibold tabular"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">{symbol}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tx-category">Категория</Label>
              <Select id="tx-category" name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {filtered.length === 0 ? <option value="">Сначала создайте категорию</option> : null}
                {filtered.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tx-date">Дата</Label>
              <div className="relative">
                <Input
                  id="tx-date"
                  name="occurredOn"
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className="pr-9"
                  required
                />
                <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tx-description" hint="Необязательно">
              Описание
            </Label>
            <Textarea
              id="tx-description"
              name="description"
              placeholder={type === "expense" ? "Например, продукты на неделю" : "Например, зарплата за октябрь"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[72px]"
              maxLength={200}
            />
          </div>

          <FieldError>{error}</FieldError>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={loading} disabled={filtered.length === 0}>
              {transaction ? "Сохранить изменения" : "Добавить операцию"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
