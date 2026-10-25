"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";

export function ResetForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await resetPasswordAction(new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error ?? "Не удалось обновить пароль");
        return;
      }
      setDone(true);
    } catch {
      setError("Не удалось обновить пароль. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface/60 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <CheckCircle2 size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Пароль обновлён</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted">Теперь войдите с новым паролем.</p>
        <Link
          href="/login"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-strong"
        >
          Перейти ко входу
        </Link>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password" hint="Минимум 8 символов">
          Новый пароль
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Буквы и цифры"
            className="pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-ink"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Повторите пароль</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Сохранить пароль <ArrowRight size={16} />
      </Button>
    </form>
  );
}
