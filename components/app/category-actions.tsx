"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/actions/categories";
import { CategoryDialog } from "@/components/app/category-dialog";
import { ConfirmAction } from "@/components/app/confirm-action";
import type { Category } from "@/lib/types";

/**
 * Client-side row actions. Dialogs and confirmations receive callbacks here,
 * which is required because functions cannot be passed from Server Components.
 */
export function CategoryRowActions({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-0.5">
      <CategoryDialog
        category={category}
        renderTrigger={(open) => (
          <button
            type="button"
            onClick={open}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label={`Редактировать ${category.name}`}
          >
            <Pencil size={14} />
          </button>
        )}
      />
      {!category.isSystem ? (
        <ConfirmAction
          title="Удалить категорию?"
          description={`Категория «${category.name}» будет удалена. Если в ней есть операции, удаление будет заблокировано — сначала перенесите их.`}
          trigger={
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
              aria-label={`Удалить ${category.name}`}
            >
              <Trash2 size={14} />
            </button>
          }
          onConfirm={async () => {
            const formData = new FormData();
            formData.set("id", category.id);
            return deleteCategoryAction(formData);
          }}
        />
      ) : null}
    </div>
  );
}
