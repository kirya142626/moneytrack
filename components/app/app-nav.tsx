"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Tags,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

const primary = [
  { href: "/dashboard", label: "Панель", icon: LayoutDashboard },
  { href: "/transactions", label: "Операции", icon: ArrowLeftRight },
  { href: "/analytics", label: "Аналитика", icon: ChartNoAxesCombined },
];

const planning = [
  { href: "/budgets", label: "Бюджеты", icon: Wallet },
  { href: "/goals", label: "Цели", icon: Target },
];

const account = [
  { href: "/categories", label: "Категории", icon: Tags },
  { href: "/settings", label: "Настройки", icon: Settings },
];

function initials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "M";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function AppNav({
  name,
  email,
  categories,
  currency,
}: {
  name: string;
  email: string;
  categories: Category[];
  currency: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [moreOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const renderLink = (item: { href: string; label: string; icon: typeof LayoutDashboard }, compact = false) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl text-[13px] font-medium transition-colors",
          compact ? "px-3 py-2.5" : "px-3 py-2.5",
          active ? "bg-brand-soft text-brand-strong" : "text-ink-soft hover:bg-surface-muted hover:text-ink",
        )}
      >
        <item.icon size={17} strokeWidth={active ? 2.1 : 1.8} className={active ? "text-brand" : "text-muted"} />
        <span className="flex-1">{item.label}</span>
        {active ? <span className="h-1.5 w-1.5 rounded-full bg-brand" /> : null}
      </Link>
    );
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-surface/70 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo size={30} />
        </div>

        <div className="px-3 pb-4">
          <TransactionDialog
            categories={categories}
            currency={currency}
            triggerClassName="w-full justify-start gap-2"
            triggerLabel="Добавить операцию"
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted/70">Обзор</p>
          <div className="space-y-0.5">{primary.map((item) => renderLink(item))}</div>

          <p className="mb-1.5 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted/70">
            Планирование
          </p>
          <div className="space-y-0.5">{planning.map((item) => renderLink(item))}</div>

          <p className="mb-1.5 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted/70">
            Аккаунт
          </p>
          <div className="space-y-0.5">{account.map((item) => renderLink(item))}</div>
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-canvas">
              {initials(name, email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-ink">{name || "Пользователь"}</p>
              <p className="truncate text-[10px] text-muted">{email}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Выйти"
                title="Выйти"
              >
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-md lg:hidden">
        <Logo size={27} />
        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Настройки"
          >
            <Settings size={17} />
          </Link>
        </div>
      </header>

      <div className="fixed bottom-[84px] right-4 z-40 lg:hidden">
        <TransactionDialog
          categories={categories}
          currency={currency}
          triggerLabel="Добавить операцию"
          renderTrigger={(open) => (
            <button
              type="button"
              onClick={open}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-on-brand shadow-lg shadow-brand/25 transition-transform active:scale-95"
              aria-label="Добавить операцию"
            >
              <Plus size={22} />
            </button>
          )}
        />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-stretch">
          {[...primary, { href: "__more__", label: "Ещё", icon: MoreHorizontal }].map((item) => {
            if (item.href === "__more__") {
              return (
                <button
                  key="more"
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                    moreOpen ? "text-brand-strong" : "text-muted hover:text-ink",
                  )}
                >
                  <MoreHorizontal size={19} />
                  Ещё
                </button>
              );
            }
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  active ? "text-brand-strong" : "text-muted hover:text-ink",
                )}
              >
                <item.icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <div className="absolute inset-0 bg-[#07110c]/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-surface-raised pb-[calc(env(safe-area-inset-bottom)+16px)] animate-scale-in">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-canvas">
                  {initials(name, email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{name || "Пользователь"}</p>
                  <p className="truncate text-[11px] text-muted">{email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
                aria-label="Закрыть меню"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {[...planning, ...account].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3 py-3 text-[13px] font-medium",
                    isActive(item.href) ? "border-brand/25 bg-brand-soft text-brand-strong" : "text-ink-soft",
                  )}
                >
                  <item.icon size={16} className={isActive(item.href) ? "text-brand" : "text-muted"} />
                  {item.label}
                </Link>
              ))}
            </div>
            <form action={signOutAction} className="mx-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-[13px] font-medium text-ink-soft hover:bg-surface-muted"
              >
                <LogOut size={15} /> Выйти из аккаунта
              </button>
            </form>
            <div className="mt-2 text-center text-[10px] text-muted">MoneyTrack · все возможности включены</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
