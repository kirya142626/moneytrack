"use server";

import { getAppContext, revalidateFinance } from "@/lib/server/context";
import { formString, isValidISODate, validateTransaction } from "@/lib/server/validation";
import { parseAmountToCents } from "@/lib/money";
import type { ActionResult, TransactionInput } from "@/lib/types";

function authError(): ActionResult {
  return { ok: false, error: "Сессия истекла. Войдите заново" };
}

export async function createTransactionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();

  const type = formString(formData, "type") === "income" ? "income" : "expense";
  const amountCents = parseAmountToCents(formString(formData, "amount"));
  const categoryId = formString(formData, "categoryId");
  const occurredOn = formString(formData, "occurredOn");
  const description = formString(formData, "description").trim();

  if (amountCents === null) return { ok: false, error: "Укажите сумму больше нуля" };

  const categories = await ctx.store.listCategories(ctx.user.id);
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return { ok: false, error: "Выберите категорию" };
  if (category.type !== type) return { ok: false, error: "Категория не соответствует типу операции" };

  const input: TransactionInput = { type, amountCents, categoryId, occurredOn, description };
  const error = validateTransaction(input);
  if (error) return { ok: false, error };

  try {
    await ctx.store.createTransaction(ctx.user.id, input);
    revalidateFinance();
    return { ok: true, message: type === "income" ? "Доход добавлен" : "Расход добавлен" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось добавить операцию" };
  }
}

export async function updateTransactionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Операция не найдена" };

  const type = formString(formData, "type") === "income" ? "income" : "expense";
  const amountCents = parseAmountToCents(formString(formData, "amount"));
  const categoryId = formString(formData, "categoryId");
  const occurredOn = formString(formData, "occurredOn");
  const description = formString(formData, "description").trim();

  if (amountCents === null) return { ok: false, error: "Укажите сумму больше нуля" };
  if (!isValidISODate(occurredOn)) return { ok: false, error: "Укажите корректную дату" };

  const categories = await ctx.store.listCategories(ctx.user.id);
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return { ok: false, error: "Выберите категорию" };
  if (category.type !== type) return { ok: false, error: "Категория не соответствует типу операции" };

  const input: TransactionInput = { type, amountCents, categoryId, occurredOn, description };
  const error = validateTransaction(input);
  if (error) return { ok: false, error };

  try {
    await ctx.store.updateTransaction(ctx.user.id, id, input);
    revalidateFinance();
    return { ok: true, message: "Операция обновлена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось обновить операцию" };
  }
}

export async function deleteTransactionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Операция не найдена" };
  try {
    await ctx.store.deleteTransaction(ctx.user.id, id);
    revalidateFinance();
    return { ok: true, message: "Операция удалена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось удалить операцию" };
  }
}
