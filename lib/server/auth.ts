import { redirect } from "next/navigation";
import { backendMode } from "@/lib/server/mode";
import {
  changePasswordLocal,
  clearLocalSession,
  getLocalUser,
  requestPasswordResetLocal,
  resetPasswordLocal,
  signInLocal,
  signUpLocal,
} from "@/lib/server/local/auth";
import {
  changePasswordSupabase,
  getSupabaseUser,
  requestPasswordResetSupabase,
  signInSupabase,
  signOutSupabase,
  signUpSupabase,
  updateSupabasePassword,
} from "@/lib/server/supabase/auth";
import { localStore } from "@/lib/server/local/store";
import { supabaseStore } from "@/lib/server/supabase/store";
import type { Profile, Store } from "@/lib/types";

export function isLocalMode(): boolean {
  return backendMode() === "local";
}

export function getStore(): Store {
  return backendMode() === "supabase" ? supabaseStore() : localStore();
}

export async function getCurrentUser(): Promise<Profile | null> {
  if (backendMode() === "supabase") return getSupabaseUser();
  return getLocalUser();
}

export async function requireUser(nextPath = "/dashboard"): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string; message?: string; needsConfirmation?: boolean }> {
  if (backendMode() === "supabase") return signUpSupabase(fullName, email, password);
  return signUpLocal(fullName, email, password);
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (backendMode() === "supabase") return signInSupabase(email, password);
  return signInLocal(email, password);
}

export async function signOut(): Promise<void> {
  if (backendMode() === "supabase") {
    await signOutSupabase();
    return;
  }
  await clearLocalSession();
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean; error?: string; message?: string; resetLink?: string }> {
  if (backendMode() === "supabase") return requestPasswordResetSupabase(email);
  return requestPasswordResetLocal(email);
}

export async function resetPassword(token: string, password: string) {
  if (backendMode() === "supabase") return updateSupabasePassword(password);
  return resetPasswordLocal(token, password);
}

export async function changePassword(current: string, next: string) {
  if (backendMode() === "supabase") return changePasswordSupabase(current, next);
  const user = await getLocalUser();
  if (!user) return { ok: false, error: "Сессия истекла. Войдите заново" };
  return changePasswordLocal(user.id, current, next);
}
