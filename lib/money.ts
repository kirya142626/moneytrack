export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "RUB", label: "Российский рубль", symbol: "₽", locale: "ru-RU" },
  { code: "USD", label: "Доллар США", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Евро", symbol: "€", locale: "de-DE" },
  { code: "KZT", label: "Казахстанский тенге", symbol: "₸", locale: "ru-KZ" },
  { code: "BYN", label: "Белорусский рубль", symbol: "Br", locale: "ru-BY" },
  { code: "UAH", label: "Украинская гривна", symbol: "₴", locale: "uk-UA" },
  { code: "GBP", label: "Фунт стерлингов", symbol: "£", locale: "en-GB" },
  { code: "TRY", label: "Турецкая лира", symbol: "₺", locale: "tr-TR" },
  { code: "AED", label: "Дирхам ОАЭ", symbol: "د.إ", locale: "ru-AE" },
];

export function currencyInfo(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatMoney(cents: number, currency = "RUB", opts?: { decimals?: number }): string {
  const { locale } = currencyInfo(currency);
  const value = cents / 100;
  const hasFraction = Math.abs(value % 1) > 0.001;
  const decimals = opts?.decimals ?? (hasFraction ? 2 : 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${value.toFixed(decimals)} ${currency}`;
  }
}

export function formatCompactMoney(cents: number, currency = "RUB"): string {
  const { locale } = currencyInfo(currency);
  const value = cents / 100;
  if (Math.abs(value) < 10_000) return formatMoney(cents, currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return formatMoney(cents, currency);
  }
}

export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat("ru-RU").format(value);
  } catch {
    return String(value);
  }
}

/** Parse a user-entered amount ("1 234,56", "1234.56") into integer cents. */
export function parseAmountToCents(raw: string): number | null {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "")
    .replace(/[₽$€₸£₺]/g, "")
    .replace(",", ".");
  if (!cleaned || !/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function centsToInput(cents: number): string {
  const v = cents / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ",");
}
