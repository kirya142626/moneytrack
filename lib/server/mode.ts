import type { BackendMode } from "@/lib/types";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function backendMode(): BackendMode {
  if (isSupabaseConfigured()) return "supabase";
  if (isVercelRuntime()) {
    throw new Error(
      "MoneyTrack: не настроен Supabase. Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в Vercel → Settings → Environment Variables и перезапустите деплой.",
    );
  }
  return "local";
}

export function appUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
