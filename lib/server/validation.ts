import { CATEGORY_ICONS } from "@/lib/categories";
import { CURRENCIES } from "@/lib/money";
import { THEME_LABELS } from "@/lib/themes";
import type { CategoryInput, GoalInput, TransactionInput } from "@/lib/types";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(name: string): string | null {
  const value = name.trim();
  if (value.length < 2) return "Укажите имя — минимум 2 символа";
  if (value.length > 60) return "Имя слишком длинное";
  return null;
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Укажите почту";
  if (!EMAIL_RE.test(value)) return "Похоже, в адресе почты ошибка";
  if (value.length > 254) return "Адрес почты слишком длинный";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Пароль должен содержать не менее 8 символов";
  if (password.length > 128) return "Пароль слишком длинный";
  if (!/[a-zA-Zа-яА-Я]/.test(password) || !/\d/.test(password)) {
    return "Добавьте в пароль хотя бы одну букву и одну цифру";
  }
  return null;
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 2000 || y > 2100) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function isValidMonth(value: string): boolean {
  return /^\d{4}-\d{2}-01$/.test(value) && isValidISODate(value);
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function validateCategory(input: CategoryInput): string | null {
  const name = input.name.trim();
  if (name.length < 2) return "Название категории — минимум 2 символа";
  if (name.length > 40) return "Название категории слишком длинное";
  if (input.type !== "income" && input.type !== "expense") return "Выберите тип категории";
  if (!CATEGORY_ICONS.includes(input.icon as (typeof CATEGORY_ICONS)[number])) return "Выберите иконку";
  if (!isHexColor(input.color)) return "Выберите цвет категории";
  return null;
}

export function validateTransaction(input: TransactionInput): string | null {
  if (input.type !== "income" && input.type !== "expense") return "Выберите тип операции";
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) return "Укажите сумму больше нуля";
  if (input.amountCents > 10_000_000_000) return "Сумма слишком большая";
  if (!isValidISODate(input.occurredOn)) return "Укажите корректную дату";
  if (input.description.length > 200) return "Описание слишком длинное";
  if (!input.categoryId) return "Выберите категорию";
  return null;
}

export function validateGoalInput(input: GoalInput): string | null {
  const name = input.name.trim();
  if (name.length < 2) return "Название цели — минимум 2 символа";
  if (name.length > 60) return "Название цели слишком длинное";
  if (!Number.isInteger(input.targetCents) || input.targetCents <= 0) return "Укажите сумму цели";
  if (input.targetCents > 10_000_000_000) return "Сумма слишком большая";
  if (input.targetDate && !isValidISODate(input.targetDate)) return "Укажите корректную дату цели";
  if (!isHexColor(input.color)) return "Выберите цвет цели";
  if (input.note.length > 300) return "Заметка слишком длинная";
  return null;
}

export function validateBudgetAmount(amountCents: number): string | null {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return "Укажите сумму бюджета";
  if (amountCents > 10_000_000_000) return "Сумма слишком большая";
  return null;
}

export function validateCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

export function validateTheme(theme: string): theme is keyof typeof THEME_LABELS {
  return theme === "light" || theme === "dark" || theme === "sand";
}

export function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}
