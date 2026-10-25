"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import {
  changePasswordAction,
  deleteAccountAction,
} from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CURRENCIES } from "@/lib/money";
import { THEME_LABELS } from "@/lib/themes";
import { cn } from "@/lib/cn";
import type { Profile, ThemeName } from "@/lib/types";

const THEMES: ThemeName[] = ["light", "dark", "sand"];

const PREVIEW: Record<ThemeName, { bg: string; surface: string; border: string; text: string; muted: string; accent: string }> = {
  light: {
    bg: "#ffffff",
    surface: "#f7f9f8",
    border: "#e6ebe8",
    text: "#0d1a14",
    muted: "#6b7b72",
    accent: "#0e9f6e",
  },
  dark: {
    bg: "#0a110e",
    surface: "#101915",
    border: "#20302a",
    text: "#eef6f1",
    muted: "#8fa49a",
    accent: "#34d399",
  },
  sand: {
    bg: "#fbf9f4",
    surface: "#f4f1e8",
    border: "#e5dfd1",
    text: "#1c1917",
    muted: "#78716c",
    accent: "#0f766e",
  },
};

export function ProfileSettingsForm({ user }: { user: Profile }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [currency, setCurrency] = useState(user.currency);
  const [theme, setTheme] = useState<ThemeName>(user.theme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("fullName", fullName);
      formData.set("currency", currency);
      formData.set("theme", theme);
      const result = await updateProfileAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить настройки");
        return;
      }
      toast(result.message ?? "Настройки сохранены");
      router.refresh();
    } catch {
      setError("Не удалось сохранить настройки. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Имя</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Как к вам обращаться"
            maxLength={60}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Электронная почта</Label>
          <Input id="email" value={user.email} disabled readOnly />
          <p className="mt-1.5 text-[10px] text-muted">Почту изменить нельзя — это логин аккаунта.</p>
        </div>
      </div>

      <div>
        <Label htmlFor="currency">Валюта</Label>
        <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.symbol} — {option.label} ({option.code})
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-[10px] text-muted">
          Валюта влияет на отображение сумм. Пересчёт курсов не выполняется — суммы остаются теми, что вы ввели.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-ink-soft">Тема оформления</span>
          <span className="text-[10px] text-muted">Доступны все темы</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {THEMES.map((name) => {
            const active = theme === name;
            const palette = PREVIEW[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => setTheme(name)}
                aria-pressed={active}
                className={cn(
                  "group relative rounded-xl border p-3 text-left transition-all",
                  active ? "border-brand ring-2 ring-[var(--mt-ring)]" : "border-line hover:border-line-strong",
                )}
              >
                <div
                  className="h-16 overflow-hidden rounded-lg border"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <div className="flex h-full">
                    <div className="w-1/3 border-r p-1.5" style={{ borderColor: palette.border, backgroundColor: palette.surface }}>
                      <div className="h-1 w-full rounded-full" style={{ backgroundColor: palette.muted, opacity: 0.4 }} />
                      <div className="mt-1 h-1 w-3/4 rounded-full" style={{ backgroundColor: palette.accent }} />
                      <div className="mt-1 h-1 w-2/3 rounded-full" style={{ backgroundColor: palette.muted, opacity: 0.3 }} />
                    </div>
                    <div className="flex-1 p-1.5">
                      <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: palette.text, opacity: 0.75 }} />
                      <div className="mt-1.5 h-4 rounded" style={{ backgroundColor: palette.surface }} />
                      <div className="mt-1 h-1 w-full rounded-full" style={{ backgroundColor: palette.border }} />
                      <div className="mt-1 h-1.5 w-2/3 rounded-full" style={{ backgroundColor: palette.accent }} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="text-[12px] font-medium text-ink">{THEME_LABELS[name].title}</span>
                  {active ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-on-brand">
                      <Check size={10} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[10px] leading-4 text-muted">{THEME_LABELS[name].description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-[10px] text-muted">Изменения применяются сразу после сохранения.</p>
        <Button type="submit" loading={loading}>
          <Save size={15} /> Сохранить
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("currentPassword", currentPassword);
      formData.set("password", password);
      formData.set("confirmPassword", confirmPassword);
      const result = await changePasswordAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось изменить пароль");
        return;
      }
      toast(result.message ?? "Пароль обновлён");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Не удалось изменить пароль. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="currentPassword">Текущий пароль</Label>
        <Input
          id="currentPassword"
          type={show ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="newPassword" hint="Минимум 8 символов">
            Новый пароль
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-ink"
              aria-label={show ? "Скрыть пароль" : "Показать пароль"}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Повторите пароль</Label>
          <Input
            id="confirmPassword"
            type={show ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      <FieldError>{error}</FieldError>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" loading={loading}>
          Обновить пароль
        </Button>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("confirmation", confirmation);
      const result = await deleteAccountAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось удалить аккаунт");
        return;
      }
    } catch {
      setError("Не удалось удалить аккаунт. Проверьте соединение и попробуйте ещё раз");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <AlertTriangle size={17} />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Удалить аккаунт</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Необратимо удалит профиль, операции, бюджеты, цели и накопления. Перед удалением при
            необходимости выгрузите операции в CSV.
          </p>
        </div>
      </div>

      {!expanded ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 border-danger/30 text-danger hover:border-danger hover:bg-danger-soft"
          onClick={() => setExpanded(true)}
        >
          <Trash2 size={14} /> Удалить аккаунт
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-danger/25 bg-danger-soft/40 p-3.5" noValidate>
          <div>
            <Label htmlFor="delete-confirmation" hint="Заглавными буквами">
              Введите УДАЛИТЬ
            </Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="УДАЛИТЬ"
              autoComplete="off"
            />
          </div>
          <FieldError>{error}</FieldError>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
              disabled={confirmation.trim().toUpperCase() !== "УДАЛИТЬ"}
            >
              Удалить навсегда
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
