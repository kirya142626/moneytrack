"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  changePassword,
  getCurrentUser,
  getStore,
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "@/lib/server/auth";
import {
  formString,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/server/validation";
import type { ActionResult } from "@/lib/types";

function safeNext(value: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function signUpAction(formData: FormData): Promise<ActionResult & { needsConfirmation?: boolean }> {
  const fullName = formString(formData, "fullName");
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const confirm = formString(formData, "confirmPassword");

  const error =
    validateName(fullName) ?? validateEmail(email) ?? validatePassword(password) ??
    (password !== confirm ? "Пароли не совпадают" : null);
  if (error) return { ok: false, error };

  const result = await signUp(fullName, email, password);
  if (!result.ok) return { ok: false, error: result.error ?? "Не удалось создать аккаунт" };
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: result.message,
    needsConfirmation: result.needsConfirmation,
  };
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const next = safeNext(formString(formData, "next"));

  const error = validateEmail(email) ?? (!password ? "Введите пароль" : null);
  if (error) return { ok: false, error };

  const result = await signIn(email, password);
  if (!result.ok) return { ok: false, error: result.error ?? "Не удалось войти" };
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult & { resetLink?: string }> {
  const email = formString(formData, "email");
  const error = validateEmail(email);
  if (error) return { ok: false, error };
  const result = await requestPasswordReset(email);
  return { ok: result.ok, message: result.message, resetLink: "resetLink" in result ? result.resetLink : undefined };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const token = formString(formData, "token");
  const password = formString(formData, "password");
  const confirm = formString(formData, "confirmPassword");
  const error = validatePassword(password) ?? (password !== confirm ? "Пароли не совпадают" : null);
  if (error) return { ok: false, error };

  const result = await resetPassword(token, password);
  if (!result.ok) return { ok: false, error: result.error ?? "Не удалось обновить пароль" };
  return { ok: true, message: "Пароль обновлён. Войдите с новым паролем." };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Сессия истекла. Войдите заново" };
  const current = formString(formData, "currentPassword");
  const password = formString(formData, "password");
  const confirm = formString(formData, "confirmPassword");
  const error =
    (!current ? "Введите текущий пароль" : null) ??
    validatePassword(password) ??
    (password !== confirm ? "Пароли не совпадают" : null);
  if (error) return { ok: false, error };
  const result = await changePassword(current, password);
  if (!result.ok) return { ok: false, error: result.error ?? "Не удалось изменить пароль" };
  return { ok: true, message: "Пароль обновлён" };
}

export async function deleteAccountAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Сессия истекла" };
  if (formString(formData, "confirmation").trim().toUpperCase() !== "УДАЛИТЬ") {
    return { ok: false, error: "Введите слово УДАЛИТЬ, чтобы подтвердить действие" };
  }
  try {
    await getStore().deleteAccount(user.id);
  } catch {
    return { ok: false, error: "Не удалось удалить аккаунт. Попробуйте ещё раз" };
  }
  await signOut();
  revalidatePath("/", "layout");
  redirect("/?deleted=1");
}
