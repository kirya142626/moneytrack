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
          <p>Личные финансы. Понятные решения.</p>
        </div>
      </div>
    </footer>
  );
}
