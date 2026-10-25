import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  ChartNoAxesCombined,
  Layers,
  TrendingUp,
} from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import {
  autoGranularity,
  buildSeries,
  categoryBreakdown,
  inPeriod,
  monthlyTotals,
  periodLabel,
  previousPeriod,
  resolvePeriod,
  resolvePeriodKey,
  savingsRate,
  summarize,
  type Granularity,
  type PeriodPreset,
} from "@/lib/finance";
import { addDaysISO, addMonthsISO, monthLabel, todayISO } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { operationsLabel } from "@/lib/plural";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodSelect } from "@/components/app/period-select";
import { StatCard } from "@/components/app/stat-card";
import { CategoryGlyph } from "@/components/ui/category-icon";
import { CashflowChart, CategoryDonut, ComparisonChart, MonthlyBars } from "@/components/charts";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Аналитика" };

const GRANULARITIES: { key: Granularity; label: string }[] = [
  { key: "day", label: "Дни" },
  { key: "week", label: "Недели" },
  { key: "month", label: "Месяцы" },
  { key: "year", label: "Годы" },
];

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; granularity?: string; view?: string }>;
}) {
  const user = await requireUser("/analytics");
  const store = getStore();
  const params = await searchParams;

  const [transactions, categories] = await Promise.all([
    store.listTransactions(user.id),
    store.listCategories(user.id),
  ]);

  const currency = user.currency;
  const today = todayISO();

  const preset: PeriodPreset = resolvePeriodKey(params.period);
  const period = resolvePeriod(preset, today);
  const prev = previousPeriod(period);

  const requestedGranularity = GRANULARITIES.some((item) => item.key === params.granularity)
    ? (params.granularity as Granularity)
    : null;
  const granularity = requestedGranularity ?? autoGranularity(period);
  const comparisonView = params.view === "year" ? "year" : "month";

  const periodTxs = transactions.filter((tx) => inPeriod(tx.occurredOn, period));
  const prevTxs = transactions.filter((tx) => inPeriod(tx.occurredOn, prev));
  const summary = summarize(periodTxs);
  const prevSummary = summarize(prevTxs);

  const series = buildSeries(periodTxs, period, granularity);
  const expenseSlices = categoryBreakdown(periodTxs, categories, "expense");
  const incomeSlices = categoryBreakdown(periodTxs, categories, "income");

  const comparisonPeriods = comparisonView === "year" ? 5 : 6;
  const comparison = Array.from({ length: comparisonPeriods }, (_, index) => {
    const offset = comparisonPeriods - 1 - index;
    const monthISO = addMonthsISO(today, -offset);
    const monthTxs = transactions.filter((tx) => tx.occurredOn.slice(0, 7) === monthISO.slice(0, 7));
    const s = summarize(monthTxs);
    return {
      label: monthLabel(monthISO, { short: true }),
      current: s.income,
      previous: s.expense,
    };
  });

  const currentVsPrev = Array.from({ length: comparisonView === "year" ? 12 : 31 }, (_, index) => {
    const day = index + 1;
    if (comparisonView === "year") {
      const year = Number(today.slice(0, 4));
      const month = String(day).padStart(2, "0");
      const current = transactions
        .filter((tx) => tx.occurredOn.slice(0, 7) === `${year}-${month}`)
        .reduce((sum, tx) => sum + tx.amountCents, 0);
      const previous = transactions
        .filter((tx) => tx.occurredOn.slice(0, 7) === `${year - 1}-${month}`)
        .reduce((sum, tx) => sum + tx.amountCents, 0);
      return { label: monthLabel(`${year}-${month}-01`, { short: true }), current, previous };
    }
    const dayISO = addDaysISO(today, -(31 - day));
    const prevISO = addDaysISO(dayISO, -31);
    const current = transactions
      .filter((tx) => tx.occurredOn === dayISO)
      .reduce((sum, tx) => sum + tx.amountCents, 0);
    const previous = transactions
      .filter((tx) => tx.occurredOn === prevISO)
      .reduce((sum, tx) => sum + tx.amountCents, 0);
    return { label: String(day), current, previous };
  });

  const monthly = monthlyTotals(transactions, 12, today);
  const avgDailyExpense = summary.expense / Math.max(series.length, 1);
  const largestExpense = periodTxs
    .filter((tx) => tx.type === "expense")
    .sort((a, b) => b.amountCents - a.amountCents)[0];
  const topExpense = expenseSlices[0];
  const rate = savingsRate(summary.income, summary.expense);

  const rangeLabel = periodLabel(period);

  if (transactions.length === 0) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Аналитика"
          description="Графики строятся на ваших реальных операциях. Чем больше данных, тем точнее картина."
        />
        <EmptyState
          icon={<ChartNoAxesCombined size={22} />}
          title="Данных пока нет"
          description="Добавьте несколько доходов и расходов — здесь появятся динамика, распределение по категориям и сравнение периодов."
          action={
            <LinkButton href="/transactions">
              Перейти к операциям <ArrowRight size={14} />
            </LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Аналитика"
        description="Динамика, структура расходов и сравнение периодов — на основе ваших операций за выбранный промежуток."
        actions={
          <>
            <PeriodSelect value={preset} basePath="/analytics" />
            <LinkButton href="/api/export" variant="outline" size="md">
              Выгрузить CSV
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          label="Баланс периода"
          value={formatMoney(summary.net, currency)}
          hint={rangeLabel}
          icon={TrendingUp}
          delta={pctChange(summary.net, prevSummary.net)}
        />
        <StatCard
          label="Доходы"
          value={formatMoney(summary.income, currency)}
          icon={ArrowDownRight}
          delta={pctChange(summary.income, prevSummary.income)}
          goodDirection="up"
        />
        <StatCard
          label="Расходы"
          value={formatMoney(summary.expense, currency)}
          icon={ArrowUpRight}
          delta={pctChange(summary.expense, prevSummary.expense)}
          goodDirection="down"
        />
        <StatCard
          label="Норма сбережений"
          value={`${Math.round(rate * 100)}%`}
          hint={summary.income > 0 ? "От доходов периода" : "Нужны доходы"}
          icon={Layers}
        />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Динамика доходов и расходов"
          description={`${rangeLabel} · ${operationsLabel(summary.count)}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto rounded-lg border border-line bg-surface p-0.5">
                {GRANULARITIES.map((item) => (
                  <Link
                    key={item.key}
                    href={`/analytics?period=${preset}&granularity=${item.key}`}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                      granularity === item.key
                        ? "bg-surface-raised text-ink shadow-sm ring-1 ring-line"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Badge tone="neutral">{rangeLabel}</Badge>
            </div>
          }
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
          <CashflowChart data={series} currency={currency} height={300} showNet />
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader
            title="Расходы по категориям"
            description={topExpense ? `Больше всего: ${topExpense.name}` : "Нет расходов в периоде"}
          />
          <CardBody>
            <CategoryDonut slices={expenseSlices.slice(0, 8)} currency={currency} height={210} />
            <div className="mt-4 space-y-2.5">
              {expenseSlices.slice(0, 6).map((slice) => (
                <div key={slice.categoryId ?? "none"} className="flex items-center gap-2.5">
                  <CategoryGlyph icon={slice.icon} color={slice.color} size="sm" className="h-6 w-6 rounded-md" />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">{slice.name}</span>
                  <span className="text-[12px] font-medium text-ink tabular">{formatMoney(slice.amount, currency)}</span>
                  <span className="w-10 text-right text-[10px] text-muted tabular">
                    {Math.round(slice.share * 100)}%
                  </span>
                </div>
              ))}
              {expenseSlices.length === 0 ? (
                <p className="text-[11px] text-muted">За выбранный период расходов не было.</p>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader
            title="Ключевые показатели"
            description="Что складывается из ваших операций"
            action={<Badge tone="brand">{monthLabel(period.to)}</Badge>}
          />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Средний расход в день",
                value: formatMoney(Math.round(avgDailyExpense), currency),
                hint: `${series.length} ${series.length === 1 ? "точка" : "точек"} на графике`,
              },
              {
                label: "Крупнейший расход",
                value: largestExpense ? formatMoney(largestExpense.amountCents, currency) : "—",
                hint: largestExpense
                  ? largestExpense.description.trim() || "Без описания"
                  : "Нет расходов",
              },
              {
                label: "Доходов в периоде",
                value: String(periodTxs.filter((tx) => tx.type === "income").length),
                hint: formatMoney(summary.income, currency),
              },
              {
                label: "Расходов в периоде",
                value: String(periodTxs.filter((tx) => tx.type === "expense").length),
                hint: formatMoney(summary.expense, currency),
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface/50 p-4">
                <p className="text-[11px] text-muted">{item.label}</p>
                <p className="mt-1.5 text-[18px] font-semibold tracking-tight text-ink tabular">{item.value}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted">{item.hint}</p>
              </div>
            ))}
            <div className="rounded-xl border border-line bg-surface/50 p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted">Структура доходов</p>
                <p className="text-[11px] font-medium text-brand-strong tabular">
                  {formatMoney(summary.income, currency)}
                </p>
              </div>
              {incomeSlices.length === 0 ? (
                <p className="mt-2 text-[11px] text-muted">Доходов за период не было.</p>
              ) : (
                <>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-muted">
                    {incomeSlices.map((slice) => (
                      <span
                        key={slice.categoryId ?? "none"}
                        style={{ width: `${Math.max(slice.share * 100, 1)}%`, backgroundColor: slice.color }}
                        title={`${slice.name} — ${Math.round(slice.share * 100)}%`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {incomeSlices.slice(0, 4).map((slice) => (
                      <span key={slice.categoryId ?? "none"} className="inline-flex items-center gap-1.5 text-[10px] text-muted">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slice.color }} />
                        {slice.name} · {Math.round(slice.share * 100)}%
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Доходы и расходы по месяцам"
            description="Последние 12 месяцев"
            action={<Badge tone="brand">12 месяцев</Badge>}
          />
          <CardBody>
            <MonthlyBars data={monthly.slice(-6)} currency={currency} height={260} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Сравнение доходов и расходов"
            description={
              comparisonView === "year"
                ? "Помесячно: доходы против расходов"
                : "Доходы против расходов по месяцам"
            }
            action={
              <div className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
                <Link
                  href={`/analytics?period=${preset}&view=month`}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-medium",
                    comparisonView === "month" ? "bg-surface-raised text-ink shadow-sm" : "text-muted",
                  )}
                >
                  6 мес
                </Link>
                <Link
                  href={`/analytics?period=${preset}&view=year`}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-medium",
                    comparisonView === "year" ? "bg-surface-raised text-ink shadow-sm" : "text-muted",
                  )}
                >
                  Год
                </Link>
              </div>
            }
          />
          <CardBody>
            <ComparisonChart data={comparison} currency={currency} height={260} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Детальное сравнение"
          description={
            comparisonView === "year"
              ? "Текущий год против предыдущего"
              : "Текущий период против предыдущего"
          }
          action={<Badge tone="neutral">{comparisonView === "year" ? "Годы" : "Дни"}</Badge>}
        />
        <CardBody>
          <ComparisonChart data={currentVsPrev} currency={currency} height={280} />
          <p className="mt-3 text-[10px] leading-5 text-muted">
            Текущий период: {rangeLabel}. Предыдущий: {periodLabel(prev)}. Линия сравнения показывает общую сумму
            операций по дням.
          </p>
        </CardBody>
      </Card>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarRange size={12} /> {rangeLabel} · {operationsLabel(summary.count)}
        </span>
        <Link href="/transactions" className="hidden items-center gap-1 hover:text-ink sm:inline-flex">
          Все операции <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
