const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_NOMINATIVE = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function startOfMonthISO(iso: string): string {
  const d = parseISO(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
}

export function endOfMonthISO(iso: string): string {
  const d = parseISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonthsISO(iso: string, months: number): string {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + months);
  return toISO(d);
}

export function diffDays(fromISO: string, toISO_: string): number {
  const a = parseISO(fromISO).getTime();
  const b = parseISO(toISO_).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function formatDate(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;
}

const WEEKDAYS_LONG = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];

export function formatLongDate(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
}

export function formatDateShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatDateNumeric(iso: string): string {
  const d = parseISO(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function monthLabel(iso: string, opts?: { short?: boolean }): string {
  const d = parseISO(iso);
  const name = opts?.short ? MONTHS_SHORT[d.getMonth()] : MONTHS_NOMINATIVE[d.getMonth()];
  return `${name} ${d.getFullYear()}`;
}

export function monthLabelFromKey(key: string): string {
  return monthLabel(`${key}-01`);
}

export function monthOptions(count = 14, from = new Date()): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    out.push({ value: toISO(d), label: monthLabel(toISO(d)) });
  }
  return out;
}

export function weekdayShort(iso: string): string {
  const d = parseISO(iso);
  const idx = (d.getDay() + 6) % 7;
  return WEEKDAYS_SHORT[idx];
}

export function startOfWeekISO(iso: string): string {
  const d = parseISO(iso);
  const idx = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - idx);
  return toISO(d);
}

export function eachDay(fromISO: string, toISO_: string): string[] {
  const out: string[] = [];
  if (diffDays(fromISO, toISO_) < 0) return out;
  let cur = fromISO;
  let guard = 0;
  while (cur <= toISO_ && guard < 1500) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
    guard += 1;
  }
  return out;
}

export function daysInMonth(iso: string): number {
  const d = parseISO(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function isSameMonth(a: string, b: string): boolean {
  return monthKey(a) === monthKey(b);
}

export function relativeDayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Сегодня";
  if (iso === addDaysISO(today, -1)) return "Вчера";
  return formatDate(iso);
}

export function daysUntil(iso: string): number {
  return diffDays(todayISO(), iso);
}

export function isoWeekNumber(iso: string): number {
  const d = parseISO(iso);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

export function currentMonthRange(): { from: string; to: string } {
  const today = todayISO();
  return { from: startOfMonthISO(today), to: today };
}
