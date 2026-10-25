"use server";

import { revalidatePath } from "next/cache";
import { getAppContext, revalidateFinance } from "@/lib/server/context";
import {
  formString,
  validateCurrency,
  validateName,
  validateTheme,
} from "@/lib/server/validation";
import type { ActionResult } from "@/lib/types";

function authError(): ActionResult {
  return { ok: false, error: "Сессия истекла. Войдите заново" };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const ctx = await getAppContext();
  if (!ctx) return authError();

  const fullName = formString(formData, "fullName");
  const currency = formString(formData, "currency");
  const theme = formString(formData, "theme");

  const error = validateName(fullName);
  if (error) return { ok: false, error };
  if (!validateCurrency(currency)) return { ok: false, error: "Выберите валюту из списка" };
  if (!validateTheme(theme)) return { ok: false, error: "Выберите тему оформления" };

  try {
    await ctx.store.updateProfile(ctx.user.id, { fullName: fullName.trim(), currency, theme });
    revalidateFinance();
    revalidatePath("/", "layout");
    return { ok: true, message: "Настройки сохранены" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось сохранить настройки" };
  }
}
