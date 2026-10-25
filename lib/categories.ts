import type { Category, TxType } from "@/lib/types";

export const EXPENSE_CATEGORIES = [
  { name: "Продукты", icon: "shopping-cart", color: "#f97316" },
  { name: "Кафе и рестораны", icon: "utensils", color: "#eab308" },
  { name: "Жильё", icon: "home", color: "#0e9f6e" },
  { name: "Транспорт", icon: "car", color: "#3b82f6" },
  { name: "Здоровье", icon: "heart-pulse", color: "#ef4444" },
  { name: "Образование", icon: "graduation-cap", color: "#8b5cf6" },
  { name: "Развлечения", icon: "clapperboard", color: "#ec4899" },
  { name: "Игры", icon: "gamepad-2", color: "#84cc16" },
  { name: "Покупки", icon: "shopping-bag", color: "#06b6d4" },
  { name: "Маркетплейсы", icon: "store", color: "#a855f7" },
  { name: "Связь и интернет", icon: "smartphone", color: "#14b8a6" },
  { name: "Подписки", icon: "repeat", color: "#6366f1" },
  { name: "Путешествия", icon: "plane", color: "#f59e0b" },
  { name: "Другое", icon: "circle-ellipsis", color: "#64748b" },
] as const;

export const INCOME_CATEGORIES = [
  { name: "Зарплата", icon: "briefcase", color: "#0e9f6e" },
  { name: "Фриланс", icon: "laptop", color: "#0ea5e9" },
  { name: "Инвестиции", icon: "trending-up", color: "#8b5cf6" },
  { name: "Подарки", icon: "gift", color: "#ec4899" },
  { name: "Другое", icon: "circle-ellipsis", color: "#64748b" },
] as const;

export const DEFAULT_CATEGORIES = [
  ...INCOME_CATEGORIES.map((c) => ({ ...c, type: "income" as TxType })),
  ...EXPENSE_CATEGORIES.map((c) => ({ ...c, type: "expense" as TxType })),
];

export const CATEGORY_COLORS = [
  "#0e9f6e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#64748b",
];

export const CATEGORY_ICONS = [
  "shopping-cart",
  "utensils",
  "home",
  "car",
  "heart-pulse",
  "graduation-cap",
  "clapperboard",
  "gamepad-2",
  "shopping-bag",
  "store",
  "smartphone",
  "repeat",
  "plane",
  "briefcase",
  "laptop",
  "trending-up",
  "gift",
  "wallet",
  "piggy-bank",
  "coffee",
  "dumbbell",
  "paw-print",
  "baby",
  "wrench",
  "circle-ellipsis",
] as const;

export const GOAL_COLORS = ["#0e9f6e", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6"];

export function categoryById(categories: Category[], id: string | null): Category | null {
  if (!id) return null;
  return categories.find((c) => c.id === id) ?? null;
}

export function categoryName(categories: Category[], id: string | null): string {
  return categoryById(categories, id)?.name ?? "Без категории";
}
