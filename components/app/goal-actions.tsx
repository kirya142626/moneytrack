"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteGoalAction } from "@/app/actions/goals";
import { GoalDialog } from "@/components/app/goal-dialog";
import { ConfirmAction } from "@/components/app/confirm-action";
import type { Goal } from "@/lib/types";

export function GoalRowActions({ goal, currency }: { goal: Goal; currency: string }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <GoalDialog
        goal={goal}
        currency={currency}
        renderTrigger={(open) => (
          <button
            type="button"
            onClick={open}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label={`Изменить цель ${goal.name}`}
          >
            <Pencil size={14} />
          </button>
        )}
      />
      <ConfirmAction
        title="Удалить цель?"
        description={`Цель «${goal.name}» и история её накоплений будут удалены. Операции в журнале останутся без изменений.`}
        trigger={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label={`Удалить цель ${goal.name}`}
          >
            <Trash2 size={14} />
          </button>
        }
        onConfirm={async () => {
          const formData = new FormData();
          formData.set("id", goal.id);
          return deleteGoalAction(formData);
        }}
      />
    </div>
  );
}
