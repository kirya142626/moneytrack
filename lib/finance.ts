import type { Budget, Category, Contribution, Goal, Transaction, TxType } from "@/lib/types";
import {
  addDaysISO,
  addMonthsISO,
  diffDays,
  eachDay,
  endOfMonthISO,
  formatDateShort,
  isoWeekNumber,
  monthKey,
  monthLabel,
  parseISO,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
} from "@/lib/date";

export interface Period {
  from: string;
  to: string;
}

export interface Summary {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export function inPeriod(iso: string, period: Period): boolean {
  return iso >= period.from && iso <= period.to;
}

export function summarize(txs: Transaction[]): Summary {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    if (tx.type === "income") income += tx.amountCents;
    else expense += tx.amountCents;
  }
  return { income, expense, net: income - expense, count: txs.length };
}

export type PeriodPreset = "thisMonth" | "lastMonth" | "last30" | "last90" | "thisYear" | "all";

export const PERIOD_PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "thisMonth", label: "Текущий месяц" },
  { key: "lastMonth", label: "Прошлый месяц" },
  { key: "last30", label: "30 дней" },
  { key: "last90", label: "90 дней" },
  { key: "thisYear", label: "Этот год" },
  { key: "all", label: "Всё время" },
];

export function resolvePeriod(preset: PeriodPreset, today = todayISO()): Period {
  switch (preset) {
    case "lastMonth": {
      const start = startOfMonthISO(addMonthsISO(today, -1));
      return { from: start, to: endOfMonthISO(start) };
    }
    case "last30":
      return { from: addDaysISO(today, -29), to: today };
    case "last90":
      return { from: addDaysISO(today, -89), to: today };
    case "thisYear":
      return { from: `${parseISO(today).getFullYear()}-01-01`, to: today };
    case "all":
      return { from: "1970-01-01", to: today };
    case "thisMonth":
    default:
      return { from: startOfMonthISO(today), to: today };
  }
}

export function previousPeriod(period: Period): Period {
  const days = diffDays(period.from, period.to) + 1;
  return { from: addDaysISO(period.from, -days), to: addDaysISO(period.from, -1) };
}

export function periodLabel(period: Period): string {
  if (period.from === "1970-01-01") return "Всё время";
  if (period.from === startOfMonthISO(period.to) && period.to === endOfMonthISO(period.to)) {
    return monthLabel(period.from);
  }
  return `${formatDateShort(period.from)} — ${formatDateShort(period.to)}`;
}

export function resolvePeriodKey(value: string | undefined): PeriodPreset {
  return PERIOD_PRESETS.find((p) => p.key === value)?.key ?? "thisMonth";
}

export type Granularity = "day" | "week" | "month" | "year";

export interface SeriesPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

function bucketKey(iso: string, granularity: Granularity): string {
  switch (granularity) {
    case "year":
      return iso.slice(0, 4);
    case "month":
      return iso.slice(0, 7);
    case "week":
      return startOfWeekISO(iso);
    case "day":
    default:
      return iso;
  }
}

function bucketLabel(key: string, granularity: Granularity): string {
  switch (granularity) {
    case "year":
      return key;
    case "month":
      return monthLabel(`${key}-01`, { short: true });
    case "week":
      return `${formatDateShort(key)}`;
    case "day":
    default:
      return formatDateShort(key);
  }
}

export function autoGranularity(period: Period): Granularity {
  const days = diffDays(period.from, period.to);
  if (days <= 45) return "day";
  if (days <= 200) return "week";
  if (days <= 900) return "month";
  return "year";
}

export function buildSeries(
  txs: Transaction[],
  period: Period,
  granularity: Granularity,
): SeriesPoint[] {
  const map = new Map<string, SeriesPoint>();
  const ensure = (key: string) => {
    if (!map.has(key)) {
      map.set(key, { key, label: bucketLabel(key, granularity), income: 0, expense: 0, net: 0 });
    }
    return map.get(key)!;
  };

  // Pre-fill the timeline so charts keep an even axis even on empty days.
  if (granularity === "day") {
    for (const day of eachDay(period.from, period.to)) ensure(day);
  } else if (granularity === "week") {
    let cur = startOfWeekISO(period.from);
    let guard = 0;
    while (cur <= period.to && guard < 300) {
      ensure(cur);
      cur = addDaysISO(cur, 7);
      guard += 1;
    }
  } else if (granularity === "month") {
    let cur = startOfMonthISO(period.from);
    let guard = 0;
    while (cur <= period.to && guard < 120) {
      ensure(cur.slice(0, 7));
      cur = startOfMonthISO(addMonthsISO(cur, 1));
      guard += 1;
    }
  } else {
    let year = Number(period.from.slice(0, 4));
    const endYear = Number(period.to.slice(0, 4));
    while (year <= endYear && year - Number(period.from.slice(0, 4)) < 100) {
      ensure(String(year));
      year += 1;
    }
  }

  for (const tx of txs) {
    if (tx.occurredOn < period.from || tx.occurredOn > period.to) continue;
    const point = ensure(bucketKey(tx.occurredOn, granularity));
    if (tx.type === "income") point.income += tx.amountCents;
    else point.expense += tx.amountCents;
    point.net = point.income - point.expense;
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export interface CategorySlice {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string;
  amount: number;
  share: number;
  count: number;
}

export function categoryBreakdown(
  txs: Transaction[],
  categories: Category[],
  type: TxType = "expense",
): CategorySlice[] {
  const filtered = txs.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amountCents, 0);
  const map = new Map<string, CategorySlice>();
  for (const tx of filtered) {
    const key = tx.categoryId ?? "__none__";
    const cat = categories.find((c) => c.id === tx.categoryId);
    if (!map.has(key)) {
      map.set(key, {
        categoryId: tx.categoryId,
        name: cat?.name ?? "Без категории",
        color: cat?.color ?? "#94a3b8",
        icon: cat?.icon ?? "circle-ellipsis",
        amount: 0,
        share: 0,
        count: 0,
      });
    }
    const slice = map.get(key)!;
    slice.amount += tx.amountCents;
    slice.count += 1;
  }
  const list = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  for (const slice of list) slice.share = total > 0 ? slice.amount / total : 0;
  return list;
}

export interface BudgetProgress {
  budget: Budget;
  category: Category | null;
  spent: number;
  remaining: number;
  pct: number;
  state: "ok" | "warning" | "over";
}

export function budgetProgress(
  budgets: Budget[],
  txs: Transaction[],
  categories: Category[],
  month: string,
): BudgetProgress[] {
  const key = month.slice(0, 7);
  const monthTxs = txs.filter((t) => t.type === "expense" && t.occurredOn.slice(0, 7) === key);
  return budgets
    .filter((b) => b.month.slice(0, 7) === key)
    .map((budget): BudgetProgress => {
      const category = budget.categoryId ? categories.find((c) => c.id === budget.categoryId) ?? null : null;
      const spent = monthTxs
        .filter((t) => (budget.categoryId ? t.categoryId === budget.categoryId : true))
        .reduce((sum, t) => sum + t.amountCents, 0);
      const pct = budget.amountCents > 0 ? spent / budget.amountCents : 0;
      return {
        budget,
        category,
        spent,
        remaining: budget.amountCents - spent,
        pct,
        state: pct > 1 ? "over" : pct >= 0.85 ? "warning" : "ok",
      };
    })
    .sort((a, b) => (a.budget.categoryId === null ? -1 : b.budget.categoryId === null ? 1 : b.pct - a.pct));
}

export interface GoalProgress {
  goal: Goal;
  saved: number;
  pct: number;
  remaining: number;
  contributions: Contribution[];
  daysLeft: number | null;
  monthlyNeeded: number | null;
  completed: boolean;
}

export function goalProgress(goal: Goal, contributions: Contribution[], today = todayISO()): GoalProgress {
  const list = contributions
    .filter((c) => c.goalId === goal.id)
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));
  const saved = list.reduce((sum, c) => sum + c.amountCents, 0);
  const pct = goal.targetCents > 0 ? Math.min(saved / goal.targetCents, 1) : 0;
  const daysLeft = goal.targetDate ? diffDays(today, goal.targetDate) : null;
  const monthsLeft = daysLeft !== null && daysLeft > 0 ? Math.max(daysLeft / 30.44, 1) : null;
  return {
    goal,
    saved,
    pct,
    remaining: Math.max(goal.targetCents - saved, 0),
    contributions: list,
    daysLeft,
    monthlyNeeded:
      monthsLeft !== null ? Math.ceil(Math.max(goal.targetCents - saved, 0) / monthsLeft) : null,
    completed: saved >= goal.targetCents,
  };
}

export interface TxFilters {
  from?: string;
  to?: string;
  type?: TxType | "all";
  categoryId?: string;
  search?: string;
  minAmountCents?: number;
  maxAmountCents?: number;
  sort?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

export function filterTransactions(
  txs: Transaction[],
  categories: Category[],
  filters: TxFilters,
): Transaction[] {
  const search = filters.search?.trim().toLowerCase();
  const result = txs.filter((tx) => {
    if (filters.from && tx.occurredOn < filters.from) return false;
    if (filters.to && tx.occurredOn > filters.to) return false;
    if (filters.type && filters.type !== "all" && tx.type !== filters.type) return false;
    if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;
    if (filters.minAmountCents !== undefined && tx.amountCents < filters.minAmountCents) return false;
    if (filters.maxAmountCents !== undefined && tx.amountCents > filters.maxAmountCents) return false;
    if (search) {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name ?? "";
      const haystack = `${tx.description} ${cat}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const sort = filters.sort ?? "date-desc";
  result.sort((a, b) => {
    switch (sort) {
      case "date-asc":
        return a.occurredOn.localeCompare(b.occurredOn) || a.createdAt.localeCompare(b.createdAt);
      case "amount-desc":
        return b.amountCents - a.amountCents;
      case "amount-asc":
        return a.amountCents - b.amountCents;
      case "date-desc":
      default:
        return b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt);
    }
  });
  return result;
}

export function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    totalPages,
    page: safePage,
  };
}

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export function monthlyTotals(txs: Transaction[], months: number, today = todayISO()): MonthlyPoint[] {
  const out: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const monthISO = addMonthsISO(today, -i);
    const key = monthKey(monthISO);
    const list = txs.filter((t) => t.type && t.occurredOn.slice(0, 7) === key);
    const s = summarize(list);
    out.push({
      key,
      label: monthLabel(monthISO, { short: true }),
      income: s.income,
      expense: s.expense,
      net: s.net,
    });
  }
  return out;
}

/** Weekly activity for the dashboard heat strip. */
export function weeklyActivity(txs: Transaction[], daysBack = 7, today = todayISO()): { date: string; count: number; net: number }[] {
  const start = addDaysISO(today, -(daysBack - 1));
  return eachDay(start, today).map((date) => {
    const list = txs.filter((t) => t.occurredOn === date);
    const s = summarize(list);
    return { date, count: list.length, net: s.net };
  });
}

export function savingsRate(income: number, expense: number): number {
  if (income <= 0) return 0;
  return (income - expense) / income;
}

export function weekLabel(iso: string): string {
  return `Неделя ${isoWeekNumber(iso)}`;
}
