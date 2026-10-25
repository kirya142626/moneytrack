"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, MailCheck } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

function strength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-zA-Zа-яА-Я]/.test(password) && /\d/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-ZА-Я]/.test(password) && /[^a-zA-Zа-яА-Я0-9]/.test(password)) score += 1;
  return { score, label: ["Слишком простой", "Слабый", "Нормальный", "Хороший", "Надёжный"][score] };
}

export function SignupForm({ next = "/dashboard" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const strengthInfo = strength(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!terms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    try {
      const result = await signUpAction(new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error ?? "Не удалось создать аккаунт");
        toast(result.error ?? "Не удалось создать аккаунт", "error");
        return;
      }
      if (result.needsConfirmation) {
        setConfirmation(result.message ?? "Проверьте почту и подтвердите адрес.");
        return;
      }
      toast("Аккаунт создан. Добро пожаловать!");
      router.push(next);
      router.refresh();
    } catch {
      setError("Не удалось создать аккаунт. Проверьте соединение");
      toast("Не удалось создать аккаунт. Проверьте соединение", "error");
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-line bg-surface/60 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <MailCheck size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Подтвердите почту</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted">{confirmation}</p>
        <Link
          href="/login"
          className="mt-5 inline-flex text-[13px] font-medium text-brand-strong underline-offset-2 hover:underline"
        >
          Перейти ко входу
        </Link>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="fullName">Как вас зовут</Label>
        <Input id="fullName" name="fullName" autoComplete="name" placeholder="Анна" required />
      </div>
      <div>
        <Label htmlFor="email">Электронная почта</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <div>
        <Label htmlFor="password" hint="Минимум 8 символов">
          Пароль
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Буквы и цифры"
            className="pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {password ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < strengthInfo.score ? (strengthInfo.score >= 3 ? "bg-brand" : "bg-warning") : "bg-surface-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted">{strengthInfo.label}</span>
          </div>
        ) : null}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Повторите пароль</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Ещё раз"
          required
        />
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-5 text-muted">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => {
            setTerms(e.target.checked);
            if (e.target.checked) setTermsError(false);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-[var(--mt-accent)]"
        />
        <span>
          Согласен с{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            условиями
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            политикой конфиденциальности
          </Link>
        </span>
      </label>
      {termsError ? <FieldError>Отметьте согласие с условиями</FieldError> : null}
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Создать аккаунт
        {!loading ? <ArrowRight size={16} /> : null}
      </Button>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          <Check size={11} className="text-brand" /> Бесплатно навсегда
        </span>
        <span className="inline-flex items-center gap-1">
          <Check size={11} className="text-brand" /> Без карты
        </span>
      </div>
      <p className="text-center text-[12px] text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-brand-strong underline-offset-2 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
