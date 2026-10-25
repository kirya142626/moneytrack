import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import { backendMode } from "@/lib/server/mode";
import { formatDate } from "@/lib/date";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteAccountForm, PasswordForm, ProfileSettingsForm } from "@/components/app/settings-forms";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const store = getStore();
  const mode = backendMode();
  const categories = await store.listCategories(user.id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Настройки"
        description="Профиль, валюта, тема оформления и безопасность аккаунта. Всё сохраняется на сервере."
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader
              title="Профиль и оформление"
              description="Как вас зовут, в какой валюте считать и как выглядит MoneyTrack"
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
                  <UserRound size={15} />
                </span>
              }
            />
            <CardBody>
              <ProfileSettingsForm user={user} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Безопасность"
              description="Смена пароля. Текущая сессия останется активной."
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
                  <ShieldCheck size={15} />
                </span>
              }
            />
            <CardBody>
              <PasswordForm />
              <div className="mt-5 flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-3.5 text-[11px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-brand" />
                  Сессия хранится в HttpOnly-cookie и не доступна из JavaScript
                </span>
                <Link href="/forgot-password" className="shrink-0 font-medium text-brand-strong hover:underline">
                  Забыли текущий пароль?
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card className="border-danger/20">
            <CardHeader
              title="Аккаунт и данные"
              description="Экспорт и необратимое удаление аккаунта"
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft text-danger">
                  <Lock size={15} />
                </span>
              }
            />
            <CardBody>
              <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-medium text-ink">Выгрузка операций</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-muted">
                    CSV со всеми операциями: дата, тип, категория, описание и сумма. Доступно всегда.
                  </p>
                </div>
                <LinkButton href="/api/export" variant="outline" size="sm">
                  <Download size={14} /> Скачать CSV
                </LinkButton>
              </div>

              <div className="my-5 h-px bg-line" />

              <DeleteAccountForm />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <Card>
            <CardHeader
              title="Доступ"
              description="Без тарифов и подписок"
              action={<Badge tone="brand">Бесплатно</Badge>}
            />
            <CardBody>
              <p className="text-[12px] leading-5 text-muted">
                Все возможности MoneyTrack включены для каждого аккаунта. Никаких платных уровней, пробных периодов и
                скрытых ограничений.
              </p>
              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-ink-soft">
                {[
                  "Операции и категории без лимита",
                  "Бюджеты и цели без ограничений",
                  "Аналитика за любой период",
                  "Экспорт CSV и все темы",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/features"
                className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-strong hover:underline"
              >
                Все возможности <ArrowRight size={12} />
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Данные и инфраструктура" description="Техническая информация об аккаунте" />
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-muted">Хранилище</span>
                <span className="text-right font-medium text-ink">
                  {mode === "supabase" ? "Supabase PostgreSQL" : "Локальная SQLite"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-muted">Изоляция данных</span>
                <span className="text-right font-medium text-ink">
                  {mode === "supabase" ? "Row Level Security" : "Проверка владельца на сервере"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-muted">Категорий в аккаунте</span>
                <span className="text-right font-medium text-ink">
                  {categories.filter((c) => c.isSystem).length} стандартных
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-muted">Аккаунт создан</span>
                <span className="text-right font-medium text-ink">{formatDate(user.createdAt.slice(0, 10))}</span>
              </div>
              <div className="rounded-lg border border-line bg-surface/60 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-ink-soft">
                  <Database size={11} />{" "}
                  {mode === "supabase" ? "Production-режим" : "Режим локальной разработки"}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  {mode === "supabase"
                    ? "Данные изолированы политиками базы. Доступ к каждой записи проверяется на сервере."
                    : "Задайте переменные Supabase в .env.local, чтобы перейти на PostgreSQL. Локальные данные останутся в файле SQLite."}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
