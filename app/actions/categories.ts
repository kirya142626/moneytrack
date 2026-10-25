"use server";

import { getAppContext, revalidateFinance } from "@/lib/server/context";
import { formString, validateCategory } from "@/lib/server/validation";
import type { ActionResult, CategoryInput, TxType } from "@/lib/types";

function authError(): ActionResult {
  return { ok: false, error: "Сессия истекла. Войдите заново" };
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();

  const type: TxType = formString(formData, "type") === "income" ? "income" : "expense";
  const input: CategoryInput = {
    name: formString(formData, "name"),
    type,
    icon: formString(formData, "icon") || "circle-ellipsis",
    color: formString(formData, "color") || "#64748b",
  };
  const error = validateCategory(input);
  if (error) return { ok: false, error };

  const categories = await ctx.store.listCategories(ctx.user.id);
  if (categories.some((c) => c.name.trim().toLowerCase() === input.name.trim().toLowerCase() && c.type === type)) {
    return { ok: false, error: "Категория с таким названием уже существует" };
  }
  try {
    await ctx.store.createCategory(ctx.user.id, { ...input, type });
    revalidateFinance();
    return { ok: true, message: "Категория создана" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось создать категорию" };
  }
}

export async function updateCategoryAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Категория не найдена" };

  const type: TxType = formString(formData, "type") === "income" ? "income" : "expense";
  const input: CategoryInput = {
    name: formString(formData, "name"),
    type,
    icon: formString(formData, "icon") || "circle-ellipsis",
    color: formString(formData, "color") || "#64748b",
  };
  const error = validateCategory(input);
  if (error) return { ok: false, error };

  const categories = await ctx.store.listCategories(ctx.user.id);
  const existing = categories.find((c) => c.id === id);
  if (!existing) return { ok: false, error: "Категория не найдена" };
  if (
    categories.some(
      (c) => c.id !== id && c.type === type && c.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
    )
  ) {
    return { ok: false, error: "Категория с таким названием уже существует" };
  }
  if (existing.type !== type) {
    const transactions = await ctx.store.listTransactions(ctx.user.id);
    if (transactions.some((t) => t.categoryId === id)) {
      return { ok: false, error: "Нельзя изменить тип категории, в которой уже есть операции" };
    }
  }

  try {
    await ctx.store.updateCategory(ctx.user.id, id, input);
    revalidateFinance();
    return { ok: true, message: "Категория обновлена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось обновить категорию" };
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Категория не найдена" };
  try {
    await ctx.store.deleteCategory(ctx.user.id, id);
    revalidateFinance();
    return { ok: true, message: "Категория удалена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось удалить категорию" };
  }
}
