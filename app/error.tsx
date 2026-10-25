"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo href="/" size={38} />
      <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.16em] text-brand">Что-то пошло не так</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">Не удалось открыть страницу</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        Попробуйте обновить страницу. Если ошибка повторяется, вернитесь на главную — данные аккаунта не пострадали.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-strong"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:bg-surface"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
