import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import {
  budgetProgress,
  buildSeries,
  autoGranularity,
  categoryBreakdown,
  goalProgress,
  inPeriod,
  periodLabel,
  previousPeriod,
  resolvePeriod,
  resolvePeriodKey,
  summarize,
} from "@/lib/finance";
import {
  addMonthsISO,
  endOfMonthISO,
  formatDateShort,
  formatLongDate,
  monthLabel,
  startOfMonthISO,
  todayISO,
} from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { operationsLabel } from "@/lib/plural";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LinkButton } from "@/components/ui/button";
import { StatCard } from "@/components/app/stat-card";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { TransactionItem } from "@/components/app/transaction-item";
import { PeriodSelect } from "@/components/app/period-select";
import { CashflowChart, CategoryDonut } from "@/components/charts";
import { CategoryGlyph } from "@/components/ui/category-icon";
import type { Period, PeriodPreset } from "@/lib/finance";

export const metadata: Metadata = { title: "Панель" };

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function change(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

function previousRange(preset: PeriodPreset, period: Period, today: string): Period {
  if (preset === "thisMonth" || preset === "lastMonth") {
    const shift = preset === "thisMonth" ? -1 : -2;
    const start = startOfMonthISO(addMonthsISO(today, shift));
    return { from: start, to: endOfMonthISO(start) };
  }
  return previousPeriod(period);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await requireUser();
  const store = getStore();
  const params = await searchParams;

  const [transactions, categories, budgets, goals, contributions] = await Promise.all([
    store.listTransactions(user.id),
    store.listCategories(user.id),
    store.listBudgets(user.id),
    store.listGoals(user.id),
    store.listContributions(user.id),
  ]);

  const currency = user.currency;
  const today = todayISO();
  const preset = resolvePeriodKey(params.period);
  const period = resolvePeriod(preset, today);
  const rangeLabel =
    preset === "thisMonth"
      ? monthLabel(today)
      : preset === "lastMonth"
        ? monthLabel(addMonthsISO(today, -1))
        : periodLabel(period);

  const periodTxs = transactions.filter((tx) => inPeriod(tx.occurredOn, period));
  const summary = summarize(periodTxs);
  const prev = previousRange(preset, period, today);
  const prevSummary = summarize(transactions.filter((tx) => inPeriod(tx.occurredOn, prev)));
  const allTime = summarize(transactions);

  const series = buildSeries(periodTxs, period, autoGranularity(period));
  const slices = categoryBreakdown(periodTxs, categories, "expense");
  const recent = [...transactions].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn)).slice(0, 5);
  const budgetRows = budgetProgress(budgets, transactions, categories, today).slice(0, 3);
  const goalsSorted = goals
    .map((goal) => goalProgress(goal, contributions, today))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.pct - a.pct)
    .slice(0, 3);
  const topSlice = slices[0];

  const displayName = user.fullName.trim() || user.email.split("@")[0];

  if (transactions.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-medium text-muted">{formatLongDate(today)}</p>
            <h1 className="mt-1 text-[27px] font-semibold tracking-[-0.04em] text-ink sm:text-[31px]">
              {greeting()}, {displayName}
            </h1>
            <p className="mt-1 text-[13px] text-muted">Давайте добавим первую операцию — дальше всё посчитается само.</p>
          </div>
          <TransactionDialog categories={categories} currency={currency} />
        </div>

        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                <Wallet size={21} />
              </span>
              <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-ink">Начните с одного действия</h2>
              <p className="mt-2 max-w-md text-[13px] leading-6 text-muted">
                Добавьте доход или расход. MoneyTrack сразу покажет баланс, распределение по категориям и поможет
                поставить бюджет на месяц.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <TransactionDialog categories={categories} currency={currency} triggerLabel="Добавить операцию" />
                <TransactionDialog
                  categories={categories}
                  currency={currency}
                  defaultType="income"
                  triggerLabel="Добавить доход"
                  triggerVariant="outline"
                />
              </div>
              <div className="mt-6 space-y-2.5 border-t border-line pt-5">
                {[
                  "Категории уже настроены — выбирайте из 19 готовых",
                  "Бюджеты и цели можно добавить в любой момент",
                  "Аналитика и отчёты появятся сразу после операций",
                ].map((line) => (
                  <p key={line} className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="h-1 w-1 rounded-full bg-brand" /> {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative hidden items-center justify-center overflow-hidden border-l border-line bg-surface/50 p-8 lg:flex">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(14,159,110,0.10), transparent 60%)" }} />
              <div className="relative w-full max-w-[260px] space-y-3">
                {[
                  { icon: Plus, title: "Операция", text: "Сумма, категория, дата", accent: true },
                  { icon: Target, title: "Бюджет", text: "Лимит на месяц", accent: false },
                  { icon: PiggyBank, title: "Цель", text: "Прогресс накоплений", accent: false },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={
                      item.accent
                        ? "flex items-center gap-3 rounded-xl border border-brand/25 bg-white p-3.5 shadow-sm"
                        : "flex items-center gap-3 rounded-xl border border-line bg-white/80 p-3.5"
                    }
                  >
                    <span className={item.accent ? "flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-strong" : "flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted"}>
                      <item.icon size={16} />
                    </span>
                    <div>
                      <p className="text-[12px] font-medium text-ink">{item.title}</p>
                      <p className="text-[10px] text-muted">{item.text}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-muted/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/transactions", icon: ArrowDownLeft, title: "Все операции", text: "История, поиск и фильтры" },
            { href: "/budgets", icon: Wallet, title: "Бюджеты", text: "Лимиты на месяц" },
            { href: "/goals", icon: Target, title: "Цели", text: "Копите осознанно" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-brand/30"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-soft group-hover:text-brand-strong">
                <item.icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">{item.title}</p>
                <p className="truncate text-[11px] text-muted">{item.text}</p>
              </div>
              <ArrowRight size={14} className="ml-auto shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted">{formatLongDate(today)}</p>
          <h1 className="mt-1 text-[27px] font-semibold tracking-[-0.04em] text-ink sm:text-[31px]">
            {greeting()}, {displayName}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {rangeLabel} · {summary.count > 0 ? operationsLabel(summary.count) : "пока нет операций"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelect value={preset} />
          <TransactionDialog categories={categories} currency={currency} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          label="Текущий баланс"
          value={formatMoney(allTime.net, currency)}
          hint="Доходы минус расходы за всё время"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Доходы"
          value={formatMoney(summary.income, currency)}
          icon={ArrowDownLeft}
          delta={change(summary.income, prevSummary.income)}
          goodDirection="up"
        />
        <StatCard
          label="Расходы"
          value={formatMoney(summary.expense, currency)}
          icon={ArrowUpRight}
          delta={change(summary.expense, prevSummary.expense)}
          goodDirection="down"
        />
        <StatCard
          label="Разница"
          value={formatMoney(summary.net, currency)}
          icon={TrendingUp}
          delta={change(summary.net, prevSummary.net)}
          goodDirection="up"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Движение средств"
            description="Доходы и расходы за выбранный период"
            action={<Badge tone="neutral">{rangeLabel}</Badge>}
          />
          <CardBody>
            <div className="mb-3 flex items-center gap-4 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0e9f6e]" /> Доходы
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" /> Расходы
              </span>
            </div>
            <CashflowChart data={series} currency={currency} height={250} />
          </CardBody>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
            title="Расходы по категориям"
            description={topSlice ? `Больше всего — ${topSlice.name}` : "Нет расходов за период"}
            action={
              <Link href="/analytics" className="text-[11px] font-medium text-brand-strong hover:underline">
                Аналитика
              </Link>
            }
          />
          <CardBody>
            <CategoryDonut slices={slices.slice(0, 6)} currency={currency} height={190} />
            <div className="mt-3 space-y-2">
              {slices.slice(0, 4).map((slice) => (
                <div key={slice.categoryId ?? "none"} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-ink-soft">{slice.name}</span>
                  <span className="text-[11px] font-medium text-ink tabular">{formatMoney(slice.amount, currency)}</span>
                  <span className="w-9 text-right text-[10px] text-muted tabular">{Math.round(slice.share * 100)}%</span>
                </div>
              ))}
              {slices.length === 0 ? <p className="text-[11px] text-muted">Добавьте расход, чтобы увидеть распределение.</p> : null}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
            title="Последние операции"
            description="Свежие записи по всем счетам"
            action={
              <Link href="/transactions" className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-strong hover:underline">
                Все операции <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="divide-y divide-line border-t border-line">
            {recent.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} categories={categories} currency={currency} relative />
            ))}
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-5">
          <Card>
            <CardHeader
              title="Бюджеты месяца"
              description={budgetRows.length ? "Сколько уже потрачено" : "Лимиты пока не заданы"}
              action={
                <Link href="/budgets" className="text-[11px] font-medium text-brand-strong hover:underline">
                  Настроить
                </Link>
              }
            />
            <CardBody className="pt-0">
              {budgetRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-5 text-center">
                  <p className="text-[12px] text-muted">Поставьте общий лимит или лимиты по категориям.</p>
                  <LinkButton href="/budgets" size="sm" variant="outline" className="mt-3">
                    Создать бюджет
                  </LinkButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetRows.map((row) => (
                    <div key={row.budget.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink">
                          {row.category ? (
                            <CategoryGlyph icon={row.category.icon} color={row.category.color} size="sm" className="h-5 w-5 rounded-md" />
                          ) : (
                            <Wallet size={13} className="text-muted" />
                          )}
                          <span className="truncate">{row.category?.name ?? "Общий бюджет"}</span>
                        </span>
                        <span className="shrink-0 text-[10px] text-muted tabular">
                          {formatMoney(row.spent, currency)} / {formatMoney(row.budget.amountCents, currency)}
                        </span>
                      </div>
                      <Progress
                        value={row.pct}
                        height="h-1.5"
                        tone={row.state === "over" ? "danger" : row.state === "warning" ? "warning" : "brand"}
                      />
                      <div className="mt-1 flex justify-between text-[10px]">
                        <span className={row.state === "over" ? "text-danger" : "text-muted"}>
                          {row.state === "over" ? "Превышено" : `Осталось ${formatMoney(row.remaining, currency)}`}
                        </span>
                        <span className="text-muted tabular">{Math.round(row.pct * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Цели накопления"
              description={goalsSorted.length ? "Прогресс по вашим целям" : "Пока нет активных целей"}
              action={
                <Link href="/goals" className="text-[11px] font-medium text-brand-strong hover:underline">
                  Все цели
                </Link>
              }
            />
            <CardBody className="pt-0">
              {goalsSorted.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-5 text-center">
                  <p className="text-[12px] text-muted">Создайте цель и добавляйте накопления.</p>
                  <LinkButton href="/goals" size="sm" variant="outline" className="mt-3">
                    Создать цель
                  </LinkButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {goalsSorted.map((item) => (
                    <div key={item.goal.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.goal.color }} />
                          <span className="truncate">{item.goal.name}</span>
                          {item.completed ? <Badge tone="brand">Готово</Badge> : null}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted tabular">
                          {formatMoney(item.saved, currency)} / {formatMoney(item.goal.targetCents, currency)}
                        </span>
                      </div>
                      <Progress value={item.pct} height="h-1.5" tone={item.completed ? "brand" : "ink"} />
                      <p className="mt-1 text-[10px] text-muted">
                        {Math.round(item.pct * 100)}%
                        {item.goal.targetDate && !item.completed ? ` · до ${formatDateShort(item.goal.targetDate)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock size={12} /> Данные обновляются сразу после каждой операции
        </span>
        <Link href="/analytics" className="hidden items-center gap-1 hover:text-ink sm:inline-flex">
          Подробная аналитика <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
