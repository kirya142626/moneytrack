import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ResetForm } from "@/components/auth/reset-form";
import { getCurrentUser, isLocalMode } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Новый пароль" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const local = isLocalMode();
  const user = local ? null : await getCurrentUser();
  const valid = local ? Boolean(token) : Boolean(user);

  return (
    <div className="animate-fade-up">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Безопасность</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink">Новый пароль</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Придумайте пароль, который вы ещё не использовали в других сервисах.
      </p>
      <div className="mt-7">
        {valid ? (
          <ResetForm token={token} />
        ) : (
          <div className="rounded-2xl border border-line bg-surface/60 p-6 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <AlertTriangle size={20} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink">Ссылка недействительна</h2>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Ссылка истекла или уже была использована. Запросите новую — это займёт меньше минуты.
            </p>
            <Link
              href="/forgot-password"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-[13px] font-medium text-on-brand hover:bg-brand-strong"
            >
              Запросить новую ссылку
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
