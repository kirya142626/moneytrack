import { CategoryGlyph } from "@/components/ui/category-icon";
import { TransactionRowActions } from "@/components/app/transaction-row-actions";
import { categoryById } from "@/lib/categories";
import { formatDateShort, relativeDayLabel } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { Category, Transaction } from "@/lib/types";

export function TransactionItem({
  transaction,
  categories,
  currency,
  actions = true,
  relative = false,
}: {
  transaction: Transaction;
  categories: Category[];
  currency: string;
  actions?: boolean;
  relative?: boolean;
}) {
  const category = categoryById(categories, transaction.categoryId);
  const title = transaction.description.trim() || category?.name || "Операция";

  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <CategoryGlyph icon={category?.icon ?? "circle-ellipsis"} color={category?.color ?? "#64748b"} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {category?.name ?? "Без категории"} · {relative ? relativeDayLabel(transaction.occurredOn) : formatDateShort(transaction.occurredOn)}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-[13px] font-semibold tabular",
          transaction.type === "income" ? "text-brand-strong" : "text-ink",
        )}
      >
        {transaction.type === "income" ? "+" : "−"}
        {formatMoney(transaction.amountCents, currency)}
      </p>
      {actions ? (
        <div className="-mr-1.5 shrink-0">
          <TransactionRowActions transaction={transaction} categories={categories} currency={currency} />
        </div>
      ) : null}
    </div>
  );
}
