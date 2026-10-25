"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInAction(new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error ?? "Не удалось войти");
        toast(result.error ?? "Не удалось войти", "error");
      }
    } catch {
      setError("Не удалось войти. Проверьте соединение");
      toast("Не удалось войти. Проверьте соединение", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Электронная почта</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="text-[13px] font-medium text-ink-soft">
            Пароль
          </label>
          <Link
            href="/forgot-password"
            className="text-[11px] font-medium text-brand-strong underline-offset-2 hover:underline"
          >
            Забыли пароль?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Ваш пароль"
            className="pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError>{error}</FieldError>
      </div>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Войти
        {!loading ? <ArrowRight size={16} /> : null}
      </Button>
      <p className="pt-1 text-center text-[12px] text-muted">
        Ещё нет аккаунта?{" "}
        <Link href="/signup" className="font-medium text-brand-strong underline-offset-2 hover:underline">
          Создать бесплатно
        </Link>
      </p>
    </form>
  );
}
