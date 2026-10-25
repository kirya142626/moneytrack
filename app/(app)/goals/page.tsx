import type { Metadata } from "next";
import {
  CalendarClock,
  CheckCircle2,
  Flag,
  Target,
  TrendingUp,
} from "lucide-react";
import { getStore, requireUser } from "@/lib/server/auth";
import { goalProgress } from "@/lib/finance";
import { formatDate, formatDateShort, monthLabel, todayISO } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { countLabel } from "@/lib/plural";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { GoalDialog } from "@/components/app/goal-dialog";
import { GoalRowActions } from "@/components/app/goal-actions";
import { ContributionDialog } from "@/components/app/contribution-dialog";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Цели накопления" };

export default async function GoalsPage() {
  const user = await requireUser("/goals");
  const store = getStore();
  const [goals, contributions] = await Promise.all([
    store.listGoals(user.id),
    store.listContributions(user.id),
  ]);
  const currency = user.currency;
  const today = todayISO();

  const rows = goals
    .map((goal) => goalProgress(goal, contributions, today))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.pct - a.pct);

  const totalTarget = rows.reduce((sum, row) => sum + row.goal.targetCents, 0);
  const totalSaved = rows.reduce((sum, row) => sum + row.saved, 0);
  const completed = rows.filter((row) => row.completed).length;
  const overallPct = totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;
  const recentContributions = [...contributions]
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Цели накопления"
        description="Отпуск, подушка безопасности или крупная покупка. Добавляйте накопления и следите за прогрессом — всё пересчитывается автоматически."
        actions={<GoalDialog currency={currency} />}
      />

      {goals.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-[11px] text-muted">Накоплено</p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight text-brand-strong tabular">
              {formatMoney(totalSaved, currency)}
            </p>
            <p className="mt-1 text-[10px] text-muted">из {formatMoney(totalTarget, currency)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[11px] text-muted">Общий прогресс</p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight text-ink tabular">
              {Math.round(overallPct * 100)}%
            </p>
            <Progress className="mt-2.5" value={overallPct} height="h-1.5" />
          </Card>
          <Card className="p-4">
            <p className="text-[11px] text-muted">Цели</p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight text-ink tabular">
              {rows.length}
            </p>
            <p className="mt-1 text-[10px] text-muted">
              {completed > 0 ? `${completed} достигнуто` : "Все в процессе"}
            </p>
          </Card>
        </div>
      ) : null}

      {goals.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={<Target size={22} />}
            title="Пока нет целей"
            description="Создайте первую цель — например, накопить на отпуск. Укажите сумму и дату, а затем добавляйте накопления."
            action={<GoalDialog currency={currency} />}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-12">
          <div className="grid gap-3 sm:grid-cols-2 xl:col-span-8">
            {rows.map((row) => {
              const overdue = row.daysLeft !== null && row.daysLeft < 0 && !row.completed;
              return (
                <Card key={row.goal.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${row.goal.color}18`, color: row.goal.color }}
                      >
                        {row.completed ? <CheckCircle2 size={19} /> : <Flag size={19} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-ink">{row.goal.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {row.completed ? (
                            <Badge tone="brand">
                              <CheckCircle2 size={10} /> Достигнута
                            </Badge>
                          ) : row.goal.targetDate ? (
                            <span className={cn("text-[10px]", overdue ? "text-danger" : "text-muted")}>
                              {overdue
                                ? `Срок прошёл ${formatDateShort(row.goal.targetDate)}`
                                : `до ${formatDate(row.goal.targetDate)}`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted">Без срока</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <GoalRowActions goal={row.goal} currency={currency} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-[22px] font-semibold leading-none tracking-[-0.035em] text-ink tabular">
                        {formatMoney(row.saved, currency)}
                      </p>
                      <p className="text-[11px] text-muted tabular">{Math.round(row.pct * 100)}%</p>
                    </div>
                    <Progress
                      className="mt-2.5"
                      value={row.pct}
                      height="h-2"
                      tone={row.completed ? "brand" : overdue ? "danger" : "brand"}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
                      <span>
                        {row.completed
                          ? `Цель достигнута · ${formatMoney(row.saved - row.goal.targetCents, currency)} сверх плана`
                          : `Осталось ${formatMoney(row.remaining, currency)}`}
                      </span>
                      <span className="tabular">из {formatMoney(row.goal.targetCents, currency)}</span>
                    </div>
                  </div>

                  {row.goal.note ? (
                    <p className="mt-3 rounded-lg bg-surface/70 px-3 py-2 text-[11px] leading-5 text-ink-soft">
                      {row.goal.note}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <div className="min-w-0">
                      {row.monthlyNeeded !== null && !row.completed ? (
                        <p className="flex items-center gap-1 text-[10px] text-muted">
                          <CalendarClock size={11} />
                          Нужно ~{formatMoney(row.monthlyNeeded, currency)} / мес
                        </p>
                      ) : (
                        <p className="flex items-center gap-1 text-[10px] text-muted">
                          <TrendingUp size={11} />
                          {row.contributions.length > 0
                            ? countLabel(row.contributions.length, "накопление", "накопления", "накоплений")
                            : "Накоплений пока нет"}
                        </p>
                      )}
                    </div>
                    <ContributionDialog goals={goals} currency={currency} goal={row.goal} />
                  </div>
                </Card>
              );
            })}

          </div>

          <div className="space-y-4 xl:col-span-4">
            <Card>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">История накоплений</h2>
                  <p className="mt-0.5 text-[12px] text-muted">Последние пополнения целей</p>
                </div>
                <ContributionDialog
                  goals={goals}
                  currency={currency}
                  triggerStyle="icon"
                />
              </div>
              {recentContributions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px] leading-5 text-muted">
                    Добавьте первое накопление — история появится здесь.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {recentContributions.map((contribution) => {
                    const goal = goals.find((item) => item.id === contribution.goalId);
                    return (
                      <div key={contribution.id} className="flex items-center gap-3 px-5 py-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${goal?.color ?? "#0e9f6e"}18`,
                            color: goal?.color ?? "#0e9f6e",
                          }}
                        >
                          <Target size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-ink">
                            {goal?.name ?? "Цель удалена"}
                          </p>
                          <p className="truncate text-[10px] text-muted">
                            {formatDateShort(contribution.occurredOn)}
                            {contribution.note ? ` · ${contribution.note}` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-[12px] font-semibold text-brand-strong tabular">
                          +{formatMoney(contribution.amountCents, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-[13px] font-semibold text-ink">Как работает прогресс</h2>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Накопления не являются расходами и не меняют баланс",
                  "Прогресс считается по сумме всех пополнений цели",
                  "Если указать дату, MoneyTrack рассчитает нужный темп",
                  "Достигнутые цели остаются в истории",
                ].map((line) => (
                  <li key={line} className="flex gap-2 text-[11px] leading-5 text-muted">
                    <CheckCircle2 size={12} className="mt-1 shrink-0 text-brand" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-[10px] leading-5 text-muted">
                Сегодня {formatDate(today)}, {monthLabel(today)}
              </p>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
