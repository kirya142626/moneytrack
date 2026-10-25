import { appUrl } from "@/lib/server/mode";
import { createSupabaseServerClient } from "@/lib/server/supabase/client";
import { ensureSupabaseUserData } from "@/lib/server/supabase/store";
import type { Profile } from "@/lib/types";

export async function getSupabaseUser(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureSupabaseUserData(user.id, user.email ?? "");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  const row = profile as Record<string, unknown>;
  return {
    id: String(row.id),
    email: String(row.email || user.email || ""),
    fullName: String(row.full_name ?? ""),
    currency: String(row.currency ?? "RUB"),
    theme: (String(row.theme ?? "light") as Profile["theme"]) ?? "light",
    createdAt: String(row.created_at),
  };
}

export async function signUpSupabase(
  fullName: string,
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string; message?: string; needsConfirmation?: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName.trim() },
      emailRedirectTo: `${appUrl()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) {
    return { ok: false, error: translateAuthError(error.message) };
  }
  if (data.session) {
    return { ok: true, message: "Аккаунт создан" };
  }
  return {
    ok: true,
    needsConfirmation: true,
    message: "Мы отправили письмо для подтверждения почты. Перейдите по ссылке из письма, чтобы войти.",
  };
}

export async function signInSupabase(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

export async function signOutSupabase(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function requestPasswordResetSupabase(
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${appUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) {
    return { ok: false, message: translateAuthError(error.message) };
  }
  return {
    ok: true,
    message: "Если аккаунт с такой почтой существует, мы отправили ссылку для сброса пароля.",
  };
}

export async function updateSupabasePassword(
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

export async function changePasswordSupabase(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Сессия истекла. Войдите заново" };
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { ok: false, error: "Текущий пароль указан неверно" };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Неверная почта или пароль";
  if (m.includes("email not confirmed")) return "Подтвердите почту по ссылке из письма";
  if (m.includes("user already registered")) return "Аккаунт с такой почтой уже существует";
  if (m.includes("password should be")) return "Пароль должен содержать не менее 8 символов";
  if (m.includes("rate limit")) return "Слишком много попыток. Попробуйте немного позже";
  if (m.includes("same password")) return "Новый пароль должен отличаться от текущего";
  return "Не удалось выполнить действие. Попробуйте ещё раз";
}
