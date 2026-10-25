"use server";

import { getAppContext, revalidateFinance } from "@/lib/server/context";
import {
  formString,
  isValidISODate,
  validateGoalInput,
} from "@/lib/server/validation";
import { parseAmountToCents } from "@/lib/money";
import { todayISO } from "@/lib/date";
import type { ActionResult } from "@/lib/types";

function authError(): ActionResult {
  return { ok: false, error: "Сессия истекла. Войдите заново" };
}

function readGoal(formData: FormData) {
  return {
    name: formString(formData, "name"),
    targetCents: parseAmountToCents(formString(formData, "target")) ?? 0,
    targetDate: formString(formData, "targetDate") || null,
    note: formString(formData, "note"),
    color: formString(formData, "color") || "#0e9f6e",
  };
}

export async function createGoalAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const input = readGoal(formData);
  const error = validateGoalInput(input);
  if (error) return { ok: false, error };

  try {
    await ctx.store.createGoal(ctx.user.id, input);
    revalidateFinance();
    return { ok: true, message: "Цель создана" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось создать цель" };
  }
}

export async function updateGoalAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Цель не найдена" };
  const input = readGoal(formData);
  const error = validateGoalInput(input);
  if (error) return { ok: false, error };

  try {
    await ctx.store.updateGoal(ctx.user.id, id, input);
    revalidateFinance();
    return { ok: true, message: "Цель обновлена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось обновить цель" };
  }
}

export async function deleteGoalAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Цель не найдена" };
  try {
    await ctx.store.deleteGoal(ctx.user.id, id);
    revalidateFinance();
    return { ok: true, message: "Цель удалена" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось удалить цель" };
  }
}

export async function addContributionAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();
  const goalId = formString(formData, "goalId");
  const amountCents = parseAmountToCents(formString(formData, "amount"));
  const occurredOn = formString(formData, "occurredOn") || todayISO();
  const note = formString(formData, "note").trim();

  if (!goalId) return { ok: false, error: "Выберите цель" };
  if (amountCents === null) return { ok: false, error: "Укажите сумму накопления" };
  if (!isValidISODate(occurredOn)) return { ok: false, error: "Укажите корректную дату" };
  if (note.length > 200) return { ok: false, error: "Заметка слишком длинная" };

  const goals = await ctx.store.listGoals(ctx.user.id);
  if (!goals.some((g) => g.id === goalId)) return { ok: false, error: "Цель не найдена" };

  try {
    await ctx.store.addContribution(ctx.user.id, { goalId, amountCents, occurredOn, note });
    revalidateFinance();
    return { ok: true, message: "Накопление добавлено" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось добавить накопление" };
  }
}
