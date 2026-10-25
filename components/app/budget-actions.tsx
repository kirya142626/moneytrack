"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteBudgetAction } from "@/app/actions/budgets";
import { BudgetDialog } from "@/components/app/budget-dialog";
import { ConfirmAction } from "@/components/app/confirm-action";
import type { Budget, Category } from "@/lib/types";

export function BudgetRowActions({
  budget,
  month,
  categories,
  budgets,
  currency,
  variant,
  categoryName,
}: {
  budget: Budget;
  month: string;
  categories: Category[];
  budgets: Budget[];
  currency: string;
  variant: "overall" | "category";
  categoryName?: string;
}) {
  const overall = variant === "overall";

  return (
    <div className={overall ? "flex items-center gap-1.5" : "flex items-center gap-0.5"}>
      <BudgetDialog
        month={month}
        categories={categories}
        budgets={budgets}
        currency={currency}
        budget={budget}
        renderTrigger={(open) => (
          <button
            type="button"
            onClick={open}
            className={
              overall
                ? "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-surface-muted hover:text-ink"
                : "flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-ink"
            }
            aria-label={overall ? "Изменить общий бюджет" : "Изменить бюджет"}
          >
            <Pencil size={overall ? 14 : 12} />
          </button>
        )}
      />
      <ConfirmAction
        title={overall ? "Удалить общий бюджет?" : "Удалить лимит?"}
        description={
          overall
            ? "Лимит на этот месяц будет удалён. Операции и их категории останутся без изменений."
            : `Лимит на категорию «${categoryName ?? ""}» будет удалён. Операции останутся.`
        }
        trigger={
          <button
            type="button"
            className={
              overall
                ? "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-danger-soft hover:text-danger"
                : "flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
            }
            aria-label={overall ? "Удалить общий бюджет" : "Удалить лимит"}
          >
            <Trash2 size={overall ? 14 : 12} />
          </button>
        }
        onConfirm={async () => {
          const formData = new FormData();
          formData.set("id", budget.id);
          return deleteBudgetAction(formData);
        }}
      />
    </div>
  );
}
