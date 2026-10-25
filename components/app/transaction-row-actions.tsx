"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransactionAction } from "@/app/actions/transactions";
import { ConfirmAction } from "@/components/app/confirm-action";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { formatMoney } from "@/lib/money";
import type { Category, Transaction } from "@/lib/types";

export function TransactionRowActions({
  transaction,
  categories,
  currency,
}: {
  transaction: Transaction;
  categories: Category[];
  currency: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
        aria-label="Редактировать операцию"
      >
        <Pencil size={14} />
      </button>
      <ConfirmAction
        title="Удалить операцию?"
        description={`Операция на ${formatMoney(transaction.amountCents, currency)} будет удалена. Баланс и статистика пересчитаются автоматически.`}
        confirmLabel="Удалить"
        iconOnly
        triggerLabel="Удалить операцию"
        onConfirm={async () => {
          const formData = new FormData();
          formData.set("id", transaction.id);
          return deleteTransactionAction(formData);
        }}
        trigger={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label="Удалить операцию"
          >
            <Trash2 size={14} />
          </button>
        }
      />
      <TransactionDialog
        categories={categories}
        currency={currency}
        transaction={transaction}
        open={editing}
        onOpenChange={setEditing}
        renderTrigger={() => null}
      />
    </div>
  );
}
