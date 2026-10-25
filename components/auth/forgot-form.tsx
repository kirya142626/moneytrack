"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";

export function ForgotForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | undefined>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await forgotPasswordAction(new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error ?? "Не удалось отправить ссылку");
        return;
      }
      setMessage(result.message ?? "Проверьте почту");
      setResetLink(result.resetLink);
    } catch {
      setError("Не удалось отправить ссылку. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return (
      <div>
        <div className="rounded-2xl border border-line bg-surface/60 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <MailCheck size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">Проверьте почту</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted">{message}</p>
          {resetLink ? (
            <Link
              href={resetLink}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-strong"
            >
              Открыть ссылку сброса
            </Link>
          ) : null}
        </div>
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setResetLink(undefined);
            }}
            className="text-[12px] font-medium text-brand-strong underline-offset-2 hover:underline"
          >
            Отправить ещё раз
          </button>
          <Link href="/login" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink">
            <ArrowLeft size={12} /> Вернуться ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Электронная почта</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Отправить ссылку <ArrowRight size={16} />
      </Button>
      <div className="text-center">
        <Link href="/login" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink">
          <ArrowLeft size={12} /> Вернуться ко входу
        </Link>
      </div>
    </form>
  );
}
