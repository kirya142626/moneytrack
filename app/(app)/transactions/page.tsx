import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import {
  filterTransactions,
  paginate,
  summarize,
  type TxFilters,
} from "@/lib/finance";
import { isValidISODate } from "@/lib/server/validation";
import { parseAmountToCents, formatMoney } from "@/lib/money";
import { countLabel } from "@/lib/plural";
import { formatDateNumeric, startOfMonthISO, todayISO } from "@/lib/date";
import { categoryById } from "@/lib/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryGlyph } from "@/components/ui/category-icon";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { TransactionRowActions } from "@/components/app/transaction-row-actions";
import { TransactionItem } from "@/components/app/transaction-item";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Операции" };

const PAGE_SIZE = 12;

const sortOptions = [
  { value: "date-desc", label: "Сначала новые" },
  { value: "date-asc", label: "Сначала старые" },
  { value: "amount-desc", label: "Сумма: по убыванию" },
  { value: "amount-asc", label: "Сумма: по возрастанию" },
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/transactions");
  const store = getStore();
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };

  const [transactions, categories] = await Promise.all([
    store.listTransactions(user.id),
    store.listCategories(user.id),
  ]);
  const currency = user.currency;

  const allHistory = get("all") === "1";
  const from = get("from") && isValidISODate(get("from")) ? get("from") : allHistory ? "" : startOfMonthISO(todayISO());
  const to = get("to") && isValidISODate(get("to")) ? get("to") : allHistory ? "" : todayISO();
  const typeRaw = get("type");
  const type = typeRaw === "income" || typeRaw === "expense" ? typeRaw : "all";
  const categoryFilter = categories.some((c) => c.id === get("category")) ? get("category") : "";
  const sortRaw = get("sort");
  const sort = (sortOptions.some((s) => s.value === sortRaw) ? sortRaw : "date-desc") as NonNullable<TxFilters["sort"]>;
  const search = get("q");
  const minCents = parseAmountToCents(get("min"));
  const maxCents = parseAmountToCents(get("max"));
  const page = Math.max(1, Number.parseInt(get("page") || "1", 10) || 1);

  const filters: TxFilters = {
    from: from || undefined,
    to: to || undefined,
    type,
    categoryId: categoryFilter || undefined,
    search,
    minAmountCents: minCents ?? undefined,
    maxAmountCents: maxCents ?? undefined,
    sort,
  };
  const filtered = filterTransactions(transactions, categories, filters);
  const summary = summarize(filtered);
  const { items, totalPages, page: safePage } = paginate(filtered, page, PAGE_SIZE);

  const buildQuery = (overrides: Record<string, string | null>) => {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (allHistory) query.set("all", "1");
    if (type !== "all") query.set("type", type);
    if (categoryFilter) query.set("category", categoryFilter);
    if (search) query.set("q", search);
    if (sort !== "date-desc") query.set("sort", sort);
    if (get("min")) query.set("min", get("min"));
    if (get("max")) query.set("max", get("max"));
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === "") query.delete(key);
      else query.set(key, value);
    }
    const string = query.toString();
    return string ? `/transactions?${string}` : "/transactions";
  };

  const exportQuery = new URLSearchParams();
  if (from) exportQuery.set("from", from);
  if (to) exportQuery.set("to", to);
  if (type !== "all") exportQuery.set("type", type);
  if (categoryFilter) exportQuery.set("category", categoryFilter);
  if (search) exportQuery.set("q", search);
  if (get("min")) exportQuery.set("min", get("min"));
  if (get("max")) exportQuery.set("max", get("max"));

  const hasActiveFilters = Boolean(
    search || categoryFilter || type !== "all" || sort !== "date-desc" || get("from") || get("to") || get("all"),
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Операции"
        description="Доходы и расходы с поиском, фильтрами и полной историей. Изменения сразу влияют на баланс."
        actions={
          <>
            <LinkButton href={`/api/export?${exportQuery.toString()}`} variant="outline" size="md">
              <Download size={15} /> CSV
            </LinkButton>
            <TransactionDialog categories={categories} currency={currency} />
          </>
        }
      />

      <Card className="p-4 sm:p-5">
        <form method="get" action="/transactions" className="space-y-3">
          {allHistory ? <input type="hidden" name="all" value="1" /> : null}
          <div className="grid gap-2.5 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Поиск по описанию или категории"
                className="h-10 w-full rounded-xl border border-line-strong bg-surface-raised pl-9 pr-3 text-[13px] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
              />
            </div>
            <div className="relative">
              <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="date"
                name="from"
                defaultValue={from}
                aria-label="Дата с"
                className="h-10 w-full rounded-xl border border-line-strong bg-surface-raised pl-9 pr-2 text-[12px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
              />
            </div>
            <div className="relative">
              <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="date"
                name="to"
                defaultValue={to}
                aria-label="Дата по"
                className="h-10 w-full rounded-xl border border-line-strong bg-surface-raised pl-9 pr-2 text-[12px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
              />
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <select
              name="type"
              defaultValue={type}
              aria-label="Тип операции"
              className="h-10 rounded-xl border border-line-strong bg-surface-raised px-3 text-[12px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
            >
              <option value="all">Все операции</option>
              <option value="income">Только доходы</option>
              <option value="expense">Только расходы</option>
            </select>
            <select
              name="category"
              defaultValue={categoryFilter}
              aria-label="Категория"
              className="h-10 rounded-xl border border-line-strong bg-surface-raised px-3 text-[12px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
            >
              <option value="">Все категории</option>
              <optgroup label="Доходы">
                {categories
                  .filter((c) => c.type === "income")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Расходы">
                {categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            <select
              name="sort"
              defaultValue={sort}
              aria-label="Сортировка"
              className="h-10 rounded-xl border border-line-strong bg-surface-raised px-3 text-[12px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-strong"
              >
                <Filter size={14} /> Применить
              </button>
              {hasActiveFilters ? (
                <Link
                  href="/transactions?all=1"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:text-ink"
                  aria-label="Сбросить фильтры"
                  title="Сбросить фильтры"
                >
                  <X size={15} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                <SlidersHorizontal size={11} /> Расширенные
              </span>
              <input
                type="text"
                name="min"
                inputMode="decimal"
                defaultValue={get("min")}
                placeholder="Сумма от"
                aria-label="Сумма от"
                className="h-8 w-24 rounded-lg border border-line-strong bg-surface-raised px-2.5 text-[11px] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
              />
              <input
                type="text"
                name="max"
                inputMode="decimal"
                defaultValue={get("max")}
                placeholder="до"
                aria-label="Сумма до"
                className="h-8 w-24 rounded-lg border border-line-strong bg-surface-raised px-2.5 text-[11px] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
              />
              <span className="text-[10px] text-muted/70">·</span>
              <Link href={allHistory ? "/transactions" : "/transactions?all=1"} className="text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline">
                {allHistory ? "Только текущий месяц" : "Показать всю историю"}
              </Link>
            </div>
          </div>
        </form>
      </Card>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-surface/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted">
          Найдено <span className="font-medium text-ink">{countLabel(filtered.length, "операция", "операции", "операций")}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span className="text-muted">
            Доходы: <span className="font-medium text-brand-strong tabular">{formatMoney(summary.income, currency)}</span>
          </span>
          <span className="text-muted">
            Расходы: <span className="font-medium text-danger tabular">{formatMoney(summary.expense, currency)}</span>
          </span>
          <span className="text-muted">
            Разница: <span className="font-medium text-ink tabular">{formatMoney(summary.net, currency)}</span>
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Search size={22} />}
            title={transactions.length === 0 ? "Пока нет операций" : "Ничего не найдено"}
            description={
              transactions.length === 0
                ? "Добавьте первый доход или расход — он появится в истории, а баланс пересчитается автоматически."
                : "Попробуйте изменить период, категорию или поисковый запрос. Фильтры можно сбросить одной кнопкой."
            }
            action={
              transactions.length === 0 ? (
                <TransactionDialog categories={categories} currency={currency} />
              ) : (
                <LinkButton href="/transactions?all=1" variant="outline">
                  Сбросить фильтры
                </LinkButton>
              )
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-4 hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface/60">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Дата</th>
                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Операция</th>
                    <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Категория</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Сумма</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((tx) => {
                    const category = categoryById(categories, tx.categoryId);
                    return (
                      <tr key={tx.id} className="border-b border-line last:border-0 hover:bg-surface/40">
                        <td className="whitespace-nowrap px-5 py-3.5 text-[12px] text-muted tabular">
                          {formatDateNumeric(tx.occurredOn)}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <CategoryGlyph icon={category?.icon ?? "circle-ellipsis"} color={category?.color ?? "#64748b"} size="sm" />
                            <div className="min-w-0">
                              <p className="max-w-[320px] truncate text-[13px] font-medium text-ink">
                                {tx.description.trim() || category?.name || "Операция"}
                              </p>
                              <p className="text-[10px] text-muted">
                                {tx.type === "income" ? "Доход" : "Расход"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-[12px] text-ink-soft">{category?.name ?? "Без категории"}</span>
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap px-3 py-3.5 text-right text-[13px] font-semibold tabular",
                            tx.type === "income" ? "text-brand-strong" : "text-ink",
                          )}
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {formatMoney(tx.amountCents, currency)}
                        </td>
                        <td className="px-4 py-2">
                          <TransactionRowActions transaction={tx} categories={categories} currency={currency} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface-raised lg:hidden">
            <div className="divide-y divide-line">
              {items.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} categories={categories} currency={currency} />
              ))}
            </div>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted">
                Страница {safePage} из {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                {safePage > 1 ? (
                  <Link
                    href={buildQuery({ page: String(safePage - 1) })}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-surface-raised px-3 text-[12px] font-medium text-ink-soft hover:bg-surface-muted"
                  >
                    <ArrowLeft size={13} /> Назад
                  </Link>
                ) : null}
                {Array.from({ length: totalPages })
                  .slice(Math.max(0, safePage - 3), Math.max(0, safePage - 3) + 5)
                  .map((_, index) => {
                    const number = Math.max(0, safePage - 3) + index + 1;
                    if (number > totalPages) return null;
                    return (
                      <Link
                        key={number}
                        href={buildQuery({ page: String(number) })}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-[12px] font-medium tabular",
                          number === safePage
                            ? "border-brand/25 bg-brand-soft text-brand-strong"
                            : "border-line bg-surface-raised text-ink-soft hover:bg-surface-muted",
                        )}
                      >
                        {number}
                      </Link>
                    );
                  })}
                {safePage < totalPages ? (
                  <Link
                    href={buildQuery({ page: String(safePage + 1) })}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-surface-raised px-3 text-[12px] font-medium text-ink-soft hover:bg-surface-muted"
                  >
                    Далее <ArrowRight size={13} />
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

        </>
      )}
    </div>
  );
}
