import type { Metadata } from "next";
import Link from "next/link";
import { getStore, requireUser } from "@/lib/server/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabLinks } from "@/components/ui/tab-links";
import { CategoryGlyph } from "@/components/ui/category-icon";
import { CategoryDialog } from "@/components/app/category-dialog";
import { CategoryRowActions } from "@/components/app/category-actions";
import { formatMoney } from "@/lib/money";
import { operationsLabel } from "@/lib/plural";
import { monthKey, todayISO } from "@/lib/date";
import type { TxType } from "@/lib/types";

export const metadata: Metadata = { title: "Категории" };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser("/categories");
  const store = getStore();
  const params = await searchParams;
  const activeType: TxType = params.type === "income" ? "income" : "expense";
  const [categories, transactions] = await Promise.all([
    store.listCategories(user.id),
    store.listTransactions(user.id),
  ]);
  const currency = user.currency;
  const currentMonth = monthKey(todayISO());
  const customCount = categories.filter((c) => !c.isSystem).length;
  const visible = categories.filter((c) => c.type === activeType);
  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Категории"
        description="19 стандартных категорий уже готовы. Свои можно добавить, переименовать и оформить под себя — без ограничений."
        actions={<CategoryDialog defaultType={activeType} />}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabLinks
          items={[
            {
              href: "/categories?type=expense",
              label: "Расходы",
              count: expenseCount,
              active: activeType === "expense",
            },
            {
              href: "/categories?type=income",
              label: "Доходы",
              count: incomeCount,
              active: activeType === "income",
            },
          ]}
        />
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Badge tone="brand">Без лимита</Badge>
          <span>
            Своих категорий: <span className="font-medium text-ink">{customCount}</span>
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((category) => {
          const categoryTxs = transactions.filter((tx) => tx.categoryId === category.id);
          const monthTxs = categoryTxs.filter((tx) => tx.occurredOn.slice(0, 7) === currentMonth);
          const monthAmount = monthTxs.reduce((sum, tx) => sum + tx.amountCents, 0);
          return (
            <Card key={category.id} className="group p-4 transition-shadow hover:shadow-[0_8px_30px_-20px_rgba(13,42,29,0.3)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryGlyph icon={category.icon} color={category.color} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">{category.name}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {category.isSystem ? (
                        <span className="text-[10px] text-muted">Стандартная</span>
                      ) : (
                        <Badge tone="brand">Своя</Badge>
                      )}
                      <span className="text-[10px] text-muted">· {categoryTxs.length} оп.</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                  <CategoryRowActions category={category} />
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                <div>
                  <p className="text-[10px] text-muted">За текущий месяц</p>
                  <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink tabular">
                    {formatMoney(monthAmount, currency)}
                  </p>
                </div>
                <p className="text-[10px] text-muted">{operationsLabel(monthTxs.length)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-4 text-[11px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Стандартные категории можно переименовать и сменить им иконку, но нельзя удалить.</p>
        <Link href="/transactions" className="shrink-0 font-medium text-brand-strong hover:underline">
          Перейти к операциям →
        </Link>
      </div>
    </div>
  );
}
