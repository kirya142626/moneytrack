import { NextResponse } from "next/server";
import { backendMode } from "@/lib/server/mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SupabaseCheck = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

async function checkSupabase(): Promise<SupabaseCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return { ok: false, latencyMs: 0, error: "not configured" };
  }

  const startedAt = Date.now();

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    return { ok: response.ok, latencyMs: Date.now() - startedAt };
  } catch {
    return { ok: false, latencyMs: Date.now() - startedAt, error: "unreachable" };
  }
}

export async function GET() {
  let mode: string;
  let configOk = true;

  try {
    mode = backendMode();
  } catch {
    mode = "misconfigured";
    configOk = false;
  }

  const supabase = mode === "supabase" ? await checkSupabase() : null;
  const ok = configOk && (supabase === null || supabase.ok);

  return NextResponse.json(
    {
      status: ok ? "ok" : "error",
      service: "moneytrack",
      mode,
      checks: {
        config: configOk,
        supabase: supabase ?? "skipped",
      },
      time: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { "cache-control": "no-store, max-age=0" },
    },
  );
}
