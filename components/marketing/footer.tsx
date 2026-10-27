import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Продукт",
    links: [
      { href: "/#features", label: "Возможности" },
      { href: "/features", label: "Все функции" },
      { href: "/#security", label: "Безопасность" },
      { href: "/#faq", label: "Вопросы и ответы" },
    ],
  },
  {
    title: "Аккаунт",
    links: [
      { href: "/signup", label: "Регистрация" },
      { href: "/login", label: "Вход" },
      { href: "/forgot-password", label: "Сброс пароля" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Условия использования" },
      { href: "/terms#data", label: "Обработка данных" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo size={30} />
          <p className="mt-4 text-[13px] leading-6 text-muted">
            Спокойный сервис для учёта личных финансов. Доходы, расходы, бюджеты, цели и аналитика — без таблиц и
            лишнего шума.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Бесплатно навсегда
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link href={link.href} className="text-[13px] text-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MoneyTrack. Все права защищены.</p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/kirya142626/moneytrack"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Исходный код
            </a>
            <span aria-hidden="true">·</span>
            <p>Личные финансы. Понятные решения.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
