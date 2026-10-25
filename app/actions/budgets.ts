"use server";

import { getAppContext, revalidateFinance } from "@/lib/server/context";
import { formString, isValidMonth, validateBudgetAmount } from "@/lib/server/validation";
import { parseAmountToCents } from "@/lib/money";
import type { ActionResult } from "@/lib/types";

function authError(): ActionResult {
  return { ok: false, error: "Сессия истекла. Войдите заново" };
}

export async function saveBudgetAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();

  const month = formString(formData, "month");
  const categoryId = formString(formData, "categoryId") || null;
  const amountCents = parseAmountToCents(formString(formData, "amount"));

  if (!isValidMonth(month)) return { ok: false, error: "Укажите корректный месяц" };
  if (amountCents === null) return { ok: false, error: "Укажите сумму бюджета" };
  const amountError = validateBudgetAmount(amountCents);
  if (amountError) return { ok: false, error: amountError };

  const categories = await ctx.store.listCategories(ctx.user.id);
  if (categoryId) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return { ok: false, error: "Категория не найдена" };
    if (category.type !== "expense") return { ok: false, error: "Бюджет можно задать только для расходов" };
  }

  try {
    await ctx.store.saveBudget(ctx.user.id, { month, categoryId, amountCents });
    revalidateFinance();
    return { ok: true, message: "Бюджет сохранён" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось сохранить бюджет" };
  }
}

export async function deleteBudgetAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Бюджет не найден" };
  try {
    await ctx.store.deleteBudget(ctx.user.id, id);
    revalidateFinance();
    return { ok: true, message: "Бюджет удалён" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось удалить бюджет" };
  }
}
