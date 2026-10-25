import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Wallet } from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import { budgetProgress } from "@/lib/finance";
import { monthLabel, monthOptions, todayISO } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { countLabel } from "@/lib/plural";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryGlyph } from "@/components/ui/category-icon";
import { BudgetDialog } from "@/components/app/budget-dialog";
import { BudgetRowActions } from "@/components/app/budget-actions";
import { MonthSelect } from "@/components/app/month-select";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Бюджеты" };

function normalizeMonth(value: string | undefined): string {
  const today = todayISO();
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return today.slice(0, 7) + "-01";
  const candidate = `${value}-01`;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  if (year < 2000 || year > 2100 || month < 1 || month > 12) return today.slice(0, 7) + "-01";
  return candidate;
}

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser("/budgets");
  const store = getStore();
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const [budgets, transactions, categories] = await Promise.all([
    store.listBudgets(user.id),
    store.listTransactions(user.id),
    store.listCategories(user.id),
  ]);
  const currency = user.currency;
  const monthBudgets = budgets.filter((b) => b.month.slice(0, 7) === month.slice(0, 7));
  const rows = budgetProgress(budgets, transactions, categories, month);
  const overall = rows.find((row) => row.budget.categoryId === null) ?? null;
  const categoryRows = rows.filter((row) => row.budget.categoryId !== null);
  const overBudget = rows.filter((row) => row.state === "over");

  const planned = overall
    ? overall.budget.amountCents
    : categoryRows.reduce((sum, row) => sum + row.budget.amountCents, 0);
  const monthExpense = transactions
    .filter((tx) => tx.type === "expense" && tx.occurredOn.slice(0, 7) === month.slice(0, 7))
    .reduce((sum, tx) => sum + tx.amountCents, 0);
  const hasPlan = overall !== null || categoryRows.length > 0;
  const spent = overall
    ? overall.spent
    : hasPlan
      ? categoryRows.reduce((sum, row) => sum + row.spent, 0)
      : monthExpense;
  const remaining = hasPlan ? planned - spent : null;
  const options = monthOptions(14);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Бюджеты"
        description="Общий лимит на месяц и отдельные лимиты по категориям. MoneyTrack сам считает потраченное и предупреждает о превышении."
        actions={
          <>
            <MonthSelect value={month} options={options} basePath="/budgets" />
            <BudgetDialog
              month={month}
              categories={categories}
              budgets={budgets}
              currency={currency}
              triggerLabel="Добавить бюджет"
            />
          </>
        }
      />

      {overBudget.length > 0 ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-[12px] font-semibold text-danger">
              Превышение бюджета: {overBudget.map((row) => row.category?.name ?? "общий").join(", ")}
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-danger/80">
              Потрачено больше лимита. Проверьте операции или скорректируйте лимит на этот месяц.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-[11px] text-muted">Запланировано</p>
          <p className="mt-2 text-[22px] font-semibold tracking-tight text-ink tabular">
            {hasPlan ? formatMoney(planned, currency) : "—"}
          </p>
          <p className="mt-1 text-[10px] text-muted">{monthLabel(month)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted">Потрачено</p>
          <p className={cn("mt-2 text-[22px] font-semibold tracking-tight tabular", hasPlan && planned > 0 && spent > planned ? "text-danger" : "text-ink")}>
            {formatMoney(spent, currency)}
          </p>
          <p className="mt-1 text-[10px] text-muted">
            {hasPlan ? (planned > 0 ? `${Math.round((spent / planned) * 100)}% от лимита` : "Лимит не задан") : "За месяц, без бюджета"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted">Осталось</p>
          <p className={cn("mt-2 text-[22px] font-semibold tracking-tight tabular", remaining !== null && remaining < 0 ? "text-danger" : "text-brand-strong")}>
            {remaining !== null ? formatMoney(Math.abs(remaining), currency) : "—"}
          </p>
          <p className="mt-1 text-[10px] text-muted">
            {remaining === null ? "Лимит не задан" : remaining < 0 ? "Перерасход" : "До конца месяца"}
          </p>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-7">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Общий бюджет</h2>
              <p className="mt-0.5 text-[12px] text-muted">Лимит на все расходы на {monthLabel(month).toLowerCase()}</p>
            </div>
            <Badge tone={overall ? "brand" : "neutral"}>{monthLabel(month, { short: true })}</Badge>
          </div>
          {overall ? (
            <div className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className={cn("text-[32px] font-semibold leading-none tracking-[-0.04em] tabular", overall.state === "over" ? "text-danger" : "text-ink")}>
                    {formatMoney(overall.spent, currency)}
                  </p>
                  <p className="mt-1.5 text-[12px] text-muted">
                    из {formatMoney(overall.budget.amountCents, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <BudgetRowActions
                    budget={overall.budget}
                    month={month}
                    categories={categories}
                    budgets={budgets}
                    currency={currency}
                    variant="overall"
                  />
                </div>
              </div>
              <div className="mt-5">
                <Progress
                  value={overall.pct}
                  height="h-2.5"
                  tone={overall.state === "over" ? "danger" : overall.state === "warning" ? "warning" : "brand"}
                />
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={overall.state === "over" ? "text-danger" : "text-muted"}>
                    {overall.state === "over"
                      ? `Перерасход ${formatMoney(Math.abs(overall.remaining), currency)}`
                      : `Осталось ${formatMoney(overall.remaining, currency)}`}
                  </span>
                  <span className="font-medium text-ink tabular">{Math.round(overall.pct * 100)}%</span>
                </div>
              </div>
              {overall.state === "warning" ? (
                <p className="mt-4 rounded-lg bg-warning-soft px-3 py-2 text-[11px] text-warning">
                  Израсходовано {Math.round(overall.pct * 100)}% лимита — стоит быть внимательнее к тратам.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                compact
                icon={<Wallet size={20} />}
                title="Общий бюджет не задан"
                description="Поставьте ориентир на месяц — MoneyTrack покажет, сколько осталось и когда пора остановиться."
                action={
                  <BudgetDialog
                    month={month}
                    categories={categories}
                    budgets={budgets}
                    currency={currency}
                    defaultCategoryId={null}
                    triggerLabel="Задать общий бюджет"
                  />
                }
              />
            </div>
          )}
        </Card>

        <Card className="xl:col-span-5">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Лимиты по категориям</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {countLabel(categoryRows.length, "лимит", "лимита", "лимитов")}
              </p>
            </div>
            <Link href="/analytics" className="text-[11px] font-medium text-brand-strong hover:underline">
              Аналитика
            </Link>
          </div>
          <div className="divide-y divide-line">
            {categoryRows.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12px] leading-5 text-muted">
                  Можно задать лимит отдельно для продуктов, кафе, транспорта и других категорий.
                </p>
                <BudgetDialog
                  month={month}
                  categories={categories}
                  budgets={budgets}
                  currency={currency}
                  triggerLabel="Добавить лимит"
                />
              </div>
            ) : (
              categoryRows.map((row) => (
                <div key={row.budget.id} className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <CategoryGlyph icon={row.category?.icon ?? "circle-ellipsis"} color={row.category?.color ?? "#64748b"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[12px] font-medium text-ink">{row.category?.name ?? "Категория"}</p>
                        <span className={cn("shrink-0 text-[10px] font-medium tabular", row.state === "over" ? "text-danger" : "text-muted")}>
                          {Math.round(row.pct * 100)}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted tabular">
                        {formatMoney(row.spent, currency)} из {formatMoney(row.budget.amountCents, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <BudgetRowActions
                        budget={row.budget}
                        month={month}
                        categories={categories}
                        budgets={budgets}
                        currency={currency}
                        variant="category"
                        categoryName={row.category?.name}
                      />
                    </div>
                  </div>
                  <Progress
                    className="mt-2"
                    value={row.pct}
                    height="h-1.5"
                    tone={row.state === "over" ? "danger" : row.state === "warning" ? "warning" : "brand"}
                  />
                </div>
              ))
            )}
          </div>
          {categoryRows.length > 0 && monthBudgets.length < 20 ? (
            <div className="border-t border-line p-4">
              <BudgetDialog
                month={month}
                categories={categories}
                budgets={budgets}
                currency={currency}
                triggerLabel="Добавить лимит"
                triggerStyle="dashed"
              />
            </div>
          ) : null}
        </Card>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-surface/60 px-4 py-3 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          Бюджеты пересчитываются автоматически: вы добавляете расход — прогресс меняется сразу.
        </span>
        <Badge tone="brand">Без лимита бюджетов</Badge>
      </div>
    </div>
  );
}
