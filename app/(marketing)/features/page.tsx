import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  Check,
  Download,
  Fingerprint,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Tags,
  Target,
  Wallet,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Все возможности — бесплатно",
  description:
    "Все функции MoneyTrack доступны каждому аккаунту без подписки: операции, категории, бюджеты, цели, аналитика, экспорт CSV и темы.",
  alternates: { canonical: "/features" },
};

const groups = [
  {
    icon: LayoutDashboard,
    title: "Ежедневный учёт",
    text: "Добавляйте доходы и расходы за пару секунд и держите историю в порядке.",
    items: [
      "Неограниченное количество операций",
      "Поиск, фильтры по типу, категории и дате",
      "Сортировка и постраничный вывод",
      "Экспорт всех операций в CSV",
    ],
  },
  {
    icon: Tags,
    title: "Категории под вашу жизнь",
    text: "19 стандартных категорий уже готовы, а свои можно настроить до мелочей.",
    items: [
      "14 категорий расходов и 5 категорий доходов",
      "Маркетплейсы и игры — среди стандартных",
      "Собственные категории без лимита",
      "Своя иконка и цвет для каждой категории",
    ],
  },
  {
    icon: Wallet,
    title: "Бюджеты без ограничений",
    text: "Общий лимит на месяц и отдельные лимиты по категориям с наглядным прогрессом.",
    items: [
      "Любое количество бюджетов",
      "Общий бюджет и бюджеты по категориям",
      "Предупреждения о перерасходе",
      "История по месяцам",
    ],
  },
  {
    icon: Target,
    title: "Цели накопления",
    text: "Отпуск, подушка безопасности или крупная покупка — с понятным прогрессом.",
    items: [
      "Любое количество целей",
      "Пополнения с датой и заметкой",
      "Расчёт нужного темпа накоплений",
      "Прогноз достижения цели",
    ],
  },
  {
    icon: PieChart,
    title: "Аналитика на реальных данных",
    text: "Не просто цифры, а ответы на вопросы о ваших деньгах.",
    items: [
      "Любой период: месяц, 30 и 90 дней, год, всё время",
      "Группировка по дням, неделям, месяцам и годам",
      "Структура расходов и динамика доходов",
      "Сравнение периодов и норма сбережений",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Настройки и контроль",
    text: "Профиль, оформление и безопасность — в одном месте.",
    items: [
      "Светлая, тёмная и песочная темы",
      "Валюта отображения сумм",
      "Смена пароля и выход со всех страниц",
      "Удаление аккаунта вместе с данными",
    ],
  },
];

const faqs = [
  {
    q: "MoneyTrack действительно бесплатный?",
    a: "Да. Все функции доступны каждому аккаунту без подписки, пробного периода и банковской карты. Мы не показываем платные уровни и не урезаем возможности.",
  },
  {
    q: "Есть ли лимиты на операции, бюджеты, цели и категории?",
    a: "Нет. Добавляйте столько операций, бюджетов, целей и собственных категорий, сколько нужно. Ограничения по тарифу отсутствуют.",
  },
  {
    q: "Какие категории уже есть?",
    a: "19 стандартных категорий: 14 для расходов и 5 для доходов. Среди них «Маркетплейсы» и «Игры». Стандартные категории можно переименовать и сменить им иконку, а свои — создавать без ограничений.",
  },
  {
    q: "Можно ли выгрузить данные?",
    a: "Да, экспорт CSV доступен всем пользователям. В файл попадают дата, тип, категория, описание и сумма операций. Аккаунт и данные можно удалить в настройках.",
  },
  {
    q: "Насколько защищены мои данные?",
    a: "Каждый пользователь видит только собственные записи. В Supabase доступ ограничен политиками Row Level Security, а серверные действия дополнительно проверяют владельца. Пароли не хранятся в открытом виде.",
  },
  {
    q: "Работает ли сервис на телефоне?",
    a: "Да. На компьютере используется боковое меню, на телефоне — компактная нижняя навигация. Таблицы превращаются в карточки без горизонтальной прокрутки.",
  },
];

export default async function FeaturesPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/dashboard" : "/signup";
  const primaryLabel = user ? "Перейти в панель" : "Создать бесплатный аккаунт";

  return (
    <div>
      <section className="relative border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="hero-grid absolute inset-0 opacity-50" />
          <div className="absolute left-1/2 top-0 h-[340px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,159,110,0.10),transparent_65%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink-soft shadow-sm">
            <Badge tone="brand">Бесплатно</Badge>
            Все функции включены
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-[36px] font-semibold leading-[1.06] tracking-[-0.045em] text-ink sm:text-[50px]">
            Всё, что нужно.
            <br />
            Без тарифов и подписок.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-muted">
            MoneyTrack не делит возможности на платные и бесплатные. Каждый аккаунт получает полный набор:
            операции, категории, бюджеты, цели, аналитику и экспорт данных.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <LinkButton href={primaryHref} size="lg">
              {primaryLabel} <ArrowRight size={16} />
            </LinkButton>
            <LinkButton href="/" variant="outline" size="lg">
              На главную
            </LinkButton>
          </div>
          {!user ? (
            <p className="mt-3 text-[11px] text-muted">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="underline underline-offset-2 hover:text-ink">
                Войти
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-b border-line bg-surface/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 py-7 sm:grid-cols-4 sm:divide-x">
          {[
            { value: "0 ₽", label: "навсегда, без карты" },
            { value: "19", label: "стандартных категорий" },
            { value: "∞", label: "операций и бюджетов" },
            { value: "CSV", label: "экспорт в любой момент" },
          ].map((item, i) => (
            <div key={item.label} className={i > 0 ? "px-4 py-2 sm:px-6" : "py-2 pr-4 sm:pr-6"}>
              <p className="text-[17px] font-semibold tracking-tight text-ink">{item.value}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Возможности</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[38px]">
            Полный инструмент, а не демо-версия
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Всё связано между собой: операция попадает в бюджет, бюджет — в аналитику, а аналитика помогает принимать
            решения. Ни одна функция не спрятана за оплатой.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <article
              key={group.title}
              className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-[0_12px_40px_-24px_rgba(14,159,110,0.35)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-brand-strong">
                <group.icon size={17} strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">{group.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted">{group.text}</p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12px] leading-5 text-ink-soft">
                    <Check size={13} className="mt-0.5 shrink-0 text-brand" /> {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Почему бесплатно</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[36px]">
              Мы не продаём доступ к вашим же данным
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted">
              Нет платёжного провайдера, подписок, пробных периодов и автоматических списаний. Вам не нужно ничего
              оплачивать, чтобы вести бюджет, планировать цели и смотреть аналитику.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Fingerprint, title: "Изоляция данных", text: "Только вы видите свои записи" },
                { icon: LockKeyhole, title: "Безопасные сессии", text: "HttpOnly-cookie, серверная авторизация" },
                { icon: CalendarRange, title: "Любой период", text: "История и сравнения без ограничений" },
                { icon: Download, title: "Данные всегда ваши", text: "CSV-экспорт и удаление аккаунта" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-line bg-white p-3.5">
                  <item.icon size={16} className="text-brand-strong" />
                  <p className="mt-2 text-[12px] font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_20px_60px_-40px_rgba(13,42,29,0.35)] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-ink">Что входит в аккаунт</p>
                <p className="text-[11px] text-muted">Без доплат и условий</p>
              </div>
              <Badge tone="brand">Всё включено</Badge>
            </div>
            <div className="mt-5 space-y-2.5">
              {[
                { icon: LayoutDashboard, text: "Панель с балансом и динамикой" },
                { icon: Tags, text: "19 стандартных и свои категории" },
                { icon: Wallet, text: "Бюджеты на месяц без лимита" },
                { icon: Target, text: "Цели накопления и пополнения" },
                { icon: LineChart, text: "Аналитика за любой период" },
                { icon: BarChart3, text: "Сравнение месяцев и годов" },
                { icon: Download, text: "Экспорт операций в CSV" },
                { icon: ShieldCheck, text: "Три темы и безопасный аккаунт" },
              ].map((row) => (
                <div
                  key={row.text}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface/40 px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-strong ring-1 ring-line">
                    <row.icon size={12} />
                  </span>
                  <span className="text-[12px] text-ink-soft">{row.text}</span>
                  <Check size={12} className="ml-auto shrink-0 text-brand" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <div className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Вопросы</p>
          <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.035em] text-ink sm:text-[36px]">
            Коротко о доступе
          </h2>
        </div>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
          {faqs.map((item) => (
            <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
                {item.q}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <LinkButton href={primaryHref} size="lg">
            {primaryLabel} <ArrowRight size={15} />
          </LinkButton>
          <p className="mt-3 text-[11px] text-muted">
            Бесплатно навсегда · Без карты · Данные можно удалить в любой момент
          </p>
        </div>
      </section>
    </div>
  );
}
