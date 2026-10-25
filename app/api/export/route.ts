import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, getStore } from "@/lib/server/auth";
import { filterTransactions } from "@/lib/finance";
import { isValidISODate } from "@/lib/server/validation";
import { parseAmountToCents } from "@/lib/money";
import { categoryName } from "@/lib/categories";
import { todayISO } from "@/lib/date";
import type { TxType } from "@/lib/types";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const store = getStore();
  const params = request.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const typeParam = params.get("type");
  const type: TxType | "all" = typeParam === "income" || typeParam === "expense" ? typeParam : "all";
  const categoryId = params.get("category") || undefined;
  const search = params.get("q") || undefined;
  const min = params.get("min");
  const max = params.get("max");

  const [transactions, categories] = await Promise.all([
    store.listTransactions(user.id),
    store.listCategories(user.id),
  ]);

  const filtered = filterTransactions(transactions, categories, {
    from: from && isValidISODate(from) ? from : undefined,
    to: to && isValidISODate(to) ? to : undefined,
    type,
    categoryId,
    search,
    minAmountCents: min ? parseAmountToCents(min) ?? undefined : undefined,
    maxAmountCents: max ? parseAmountToCents(max) ?? undefined : undefined,
    sort: "date-asc",
  });

  const header = ["Дата", "Тип", "Категория", "Описание", "Сумма", "Валюта"].map(csvCell).join(";");
  const rows = filtered.map((tx) =>
    [
      tx.occurredOn,
      tx.type === "income" ? "Доход" : "Расход",
      categoryName(categories, tx.categoryId),
      tx.description,
      (tx.amountCents / 100).toFixed(2).replace(".", ","),
      user.currency,
    ]
      .map((value) => csvCell(String(value)))
      .join(";"),
  );

  const content = `\uFEFF${[header, ...rows].join("\r\n")}`;
  const filename = `moneytrack-operations-${todayISO()}.csv`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
