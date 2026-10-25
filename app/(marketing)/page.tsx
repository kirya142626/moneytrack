import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Download,
  Fingerprint,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  PieChart,
  Plus,
  ShieldCheck,
  Sparkles,
  Tags,
  Target,
  Wallet,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: LayoutDashboard,
    title: "Вся картина на одном экране",
    text: "Баланс, доходы, расходы и динамика за период. Без переключения между таблицами и приложениями.",
    visual: "chart",
  },
  {
    icon: Wallet,
    title: "Бюджеты, которые предупреждают",
    text: "Общий лимит на месяц и отдельные лимиты по категориям. Видно, сколько осталось и где уже перебор.",
    visual: "budget",
  },
  {
    icon: Target,
    title: "Цели с понятным прогрессом",
    text: "Отпуск, подушка безопасности, крупная покупка. Добавляйте накопления и следите за движением к цели.",
    visual: "goal",
  },
  {
    icon: PieChart,
    title: "Аналитика на реальных данных",
    text: "Распределение расходов, сравнение периодов и динамика по дням, неделям, месяцам и годам.",
    visual: "donut",
  },
  {
    icon: Tags,
    title: "Категории под вашу жизнь",
    text: "19 стандартных категорий уже готовы. Свои можно добавить, переименовать и настроить под себя.",
    visual: "tags",
  },
  {
    icon: Download,
    title: "Данные всегда ваши",
    text: "Выгружайте все операции в CSV в любой момент. Аккаунт и данные можно удалить в настройках.",
    visual: "export",
  },
];

function FeatureVisual({ type }: { type: string }) {
  if (type === "chart") {
    return (
      <div className="mt-5 rounded-xl border border-line bg-surface/60 p-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-muted">Доходы за месяц</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-ink tabular">96 000 ₽</p>
          </div>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-strong">+12,4%</span>
        </div>
        <svg viewBox="0 0 240 44" className="mt-2 h-10 w-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0 36 C24 34 28 24 48 27 C68 30 78 18 98 21 C118 24 128 12 148 15 C168 18 176 8 198 11 C216 13 228 5 240 7 L240 44 L0 44 Z" fill="rgba(14,159,110,0.1)" />
          <path d="M0 36 C24 34 28 24 48 27 C68 30 78 18 98 21 C118 24 128 12 148 15 C168 18 176 8 198 11 C216 13 228 5 240 7" fill="none" stroke="#0e9f6e" strokeWidth="1.6" />
        </svg>
      </div>
    );
  }
  if (type === "budget") {
    return (
      <div className="mt-5 space-y-2.5 rounded-xl border border-line bg-surface/60 p-3">
        {[
          { label: "Продукты", pct: 72, color: "#0e9f6e" },
          { label: "Кафе", pct: 96, color: "#d97706" },
          { label: "Транспорт", pct: 41, color: "#3b82f6" },
        ].map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-ink-soft">{row.label}</span>
              <span className="text-muted tabular">{row.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "goal") {
    return (
      <div className="mt-5 rounded-xl border border-line bg-surface/60 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "conic-gradient(#0e9f6e 68%, #e6ebe8 0)" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-ink">68%</div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-ink">Отпуск мечты</p>
            <p className="text-[10px] text-muted">136 000 из 200 000 ₽</p>
          </div>
        </div>
      </div>
    );
  }
  if (type === "donut") {
    return (
      <div className="mt-5 flex items-center gap-4 rounded-xl border border-line bg-surface/60 p-4">
        <div className="relative h-16 w-16 shrink-0 rounded-full" style={{ background: "conic-gradient(#0e9f6e 0 38%, #f97316 38% 63%, #3b82f6 63% 80%, #ec4899 80% 100%)" }}>
          <div className="absolute inset-[7px] flex items-center justify-center rounded-full bg-white text-[9px] font-medium text-muted">Расходы</div>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted">
          <p><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#0e9f6e]" />Жильё — 38%</p>
          <p><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#f97316]" />Продукты — 25%</p>
          <p><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />Транспорт — 17%</p>
        </div>
      </div>
    );
  }
  if (type === "tags") {
    return (
      <div className="mt-5 flex flex-wrap gap-1.5 rounded-xl border border-line bg-surface/60 p-3">
        {["Продукты", "Жильё", "Кафе", "Здоровье", "Своя категория"].map((tag, i) => (
          <span key={tag} className={i === 4 ? "rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-[10px] font-medium text-brand-strong" : "rounded-full border border-line bg-white px-2.5 py-1 text-[10px] text-ink-soft"}>
            {tag}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-strong ring-1 ring-line">
        <Download size={16} />
      </span>
      <div>
        <p className="text-[11px] font-medium text-ink">operations-2026.csv</p>
        <p className="text-[10px] text-muted">Готово к Excel и Google Sheets</p>
      </div>
      <span className="ml-auto rounded-md bg-brand-soft px-2 py-1 text-[9px] font-medium text-brand-strong">CSV</span>
    </div>
  );
}

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
    q: "Как защищены мои данные?",
    a: "Каждый пользователь видит только свои записи. Доступ к таблицам ограничен политиками Row Level Security, а серверные действия дополнительно проверяют владельца данных. Пароли не хранятся в открытом виде.",
  },
  {
    q: "Можно ли пользоваться MoneyTrack на телефоне?",
    a: "Да, интерфейс полностью адаптирован: на компьютере — боковое меню, на телефоне — компактная нижняя навигация. Таблицы превращаются в удобные карточки без горизонтальной прокрутки.",
  },
  {
    q: "Можно ли выгрузить свои данные?",
    a: "Да. Экспорт CSV доступен всем пользователям без ограничений. В файл попадают дата, тип, категория, описание и сумма операций.",
  },
  {
    q: "Что будет с данными, если я удалю аккаунт?",
    a: "Удаление аккаунта необратимо удаляет профиль, операции, бюджеты, цели и накопления. Перед удалением можно выгрузить операции в CSV.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,159,110,0.10),transparent_65%)]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-24 lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-[12px] font-medium text-ink-soft shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Личные финансы без таблиц и догадок
            </span>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.045em] text-ink sm:text-[54px] lg:text-[58px]">
              Деньги под контролем.
              <br />
              <span className="text-brand-strong">Каждый день.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted sm:text-base">
              MoneyTrack собирает доходы, расходы, бюджеты и цели в одном спокойном интерфейсе. Вы сразу видите, куда
              уходят деньги — и что с этим делать.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <LinkButton href="/signup" size="lg" className="group">
                Создать аккаунт
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </LinkButton>
              <LinkButton href="/features" variant="outline" size="lg">
                Все возможности
              </LinkButton>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted">
              {["Бесплатно навсегда", "Без банковской карты", "Данные принадлежат вам"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check size={13} className="text-brand" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 py-7 sm:grid-cols-4 sm:divide-x">
          {[
            { value: "19", label: "стандартных категорий" },
            { value: "0 ₽", label: "навсегда, без карты" },
            { value: "3 темы", label: "светлая, тёмная, песочная" },
            { value: "CSV", label: "экспорт без потери данных" },
          ].map((item, i) => (
            <div key={item.label} className={i > 0 ? "px-4 py-2 sm:px-6" : "py-2 pr-4 sm:pr-6"}>
              <p className="text-[17px] font-semibold tracking-tight text-ink">{item.value}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Возможности</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[38px]">
            Всё, что нужно для ясности в деньгах
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Не набор случайных виджетов, а связанная система: операция попадает в бюджет, бюджет — в аналитику, а
            аналитика помогает принимать решения.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-[0_12px_40px_-24px_rgba(14,159,110,0.35)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-brand-strong">
                  <feature.icon size={17} strokeWidth={1.9} />
                </span>
                <span className="text-[11px] font-medium text-muted/60 tabular">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-muted">{feature.text}</p>
              <div className="mt-auto">
                <FeatureVisual type={feature.visual} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Аналитика</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[36px]">
              Не просто цифры, а ответы на вопросы
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted">
              Сколько уходит на жильё? Расходы растут или это разовая покупка? Хватает ли дохода на цели? MoneyTrack
              отвечает на эти вопросы на ваших реальных данных.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: LineChart, text: "Динамика доходов и расходов по дням, неделям, месяцам и годам" },
                { icon: PieChart, text: "Распределение расходов по категориям с долями и суммами" },
                { icon: BarChart3, text: "Сравнение периодов: что изменилось и насколько" },
                { icon: Sparkles, text: "Ключевые показатели: норма сбережений, средний расход, топ категорий" },
              ].map((item) => (
                <li key={item.text} className="flex gap-3 text-[13px] leading-6 text-ink-soft">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-white text-brand-strong">
                    <item.icon size={13} />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <LinkButton href="/signup" variant="outline" size="md">
                Попробовать бесплатно
                <ArrowRight size={15} />
              </LinkButton>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_20px_60px_-40px_rgba(13,42,29,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-ink">Обзор периода</p>
                <p className="text-[11px] text-muted">1 — 25 октября 2026</p>
              </div>
              <Badge tone="brand">Демо-данные</Badge>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "Доходы", value: "96 000 ₽", tone: "text-brand-strong" },
                { label: "Расходы", value: "58 340 ₽", tone: "text-ink" },
                { label: "Разница", value: "+37 660 ₽", tone: "text-brand-strong" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-line bg-surface/50 p-2.5">
                  <p className="text-[10px] text-muted">{stat.label}</p>
                  <p className={`mt-1 text-[13px] font-semibold tracking-tight tabular ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-line p-3">
              <svg viewBox="0 0 360 150" className="h-[150px] w-full" preserveAspectRatio="none" aria-hidden>
                {[30, 60, 90, 120].map((y) => (
                  <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#e6ebe8" strokeDasharray="3 5" />
                ))}
                <path
                  d="M0 118 C30 112 40 92 70 96 C100 100 110 70 140 74 C170 78 180 58 210 62 C240 66 250 42 280 46 C310 50 330 28 360 30 L360 150 L0 150 Z"
                  fill="rgba(14,159,110,0.09)"
                />
                <path
                  d="M0 118 C30 112 40 92 70 96 C100 100 110 70 140 74 C170 78 180 58 210 62 C240 66 250 42 280 46 C310 50 330 28 360 30"
                  fill="none"
                  stroke="#0e9f6e"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M0 132 C32 128 44 116 76 118 C108 120 120 100 152 103 C184 106 196 90 228 94 C260 98 272 78 304 82 C326 85 344 70 360 72"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-medium text-ink-soft">Топ категория</p>
                <p className="mt-1 text-[14px] font-semibold text-ink">Жильё</p>
                <p className="text-[10px] text-muted">22 000 ₽ · 38% расходов</p>
                <div className="mt-2 h-1.5 rounded-full bg-surface-muted">
                  <div className="h-full w-[38%] rounded-full bg-brand" />
                </div>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-medium text-ink-soft">Норма сбережений</p>
                <p className="mt-1 text-[14px] font-semibold text-brand-strong">39%</p>
                <p className="text-[10px] text-muted">От дохода за период</p>
                <div className="mt-2 h-1.5 rounded-full bg-surface-muted">
                  <div className="h-full w-[39%] rounded-full bg-brand" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Как это работает</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[36px]">
              Начать можно за пару минут
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted">
              Без подключения банка и сложной настройки. Добавьте операцию — остальное MoneyTrack посчитает сам.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", title: "Создайте аккаунт", text: "Почта и пароль. Бесплатно и без карты." },
              { n: "02", title: "Добавьте операции", text: "Доходы и расходы с категорией и датой." },
              { n: "03", title: "Смотрите картину", text: "Бюджеты, цели и аналитика обновляются сразу." },
            ].map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-white p-5">
                <span className="text-[11px] font-semibold text-brand tabular">{step.n}</span>
                <h3 className="mt-3 text-[14px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="free" className="scroll-mt-20 border-y border-line bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Доступ</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[38px]">
              Все возможности включены. Бесплатно
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted">
              Никаких тарифов, платных уровней и пробных периодов. Полный инструмент для каждого аккаунта — с первого
              дня и без банковской карты.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                value: "0 ₽",
                title: "Без оплаты",
                text: "Нет подписки, скрытых списаний и платёжного провайдера. Доступ не заканчивается.",
              },
              {
                value: "∞",
                title: "Без лимитов",
                text: "Операции, бюджеты, цели, собственные категории и история — без ограничений.",
              },
              {
                value: "CSV",
                title: "Без привязки",
                text: "Экспорт всех операций, смена темы и удаление аккаунта вместе с данными.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-white p-6">
                <p className="text-[26px] font-semibold tracking-[-0.04em] text-brand-strong">{item.value}</p>
                <h3 className="mt-2 text-[15px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12px] leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <LinkButton href="/signup" size="lg">
              Создать аккаунт <ArrowRight size={16} />
            </LinkButton>
            <LinkButton href="/features" variant="outline" size="lg">
              Подробнее о возможностях
            </LinkButton>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="p-7 sm:p-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                <ShieldCheck size={19} />
              </span>
              <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[32px]">
                Ваши финансы — только ваши
              </h2>
              <p className="mt-3 text-[14px] leading-7 text-muted">
                Мы не продаём данные, не показываем рекламу и не даём доступ к вашим записям другим пользователям.
                Всё, что вы добавляете, принадлежит вам.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Fingerprint, title: "Изоляция данных", text: "Row Level Security и проверка владельца" },
                  { icon: LockKeyhole, title: "Безопасные сессии", text: "HttpOnly-cookie, серверная авторизация" },
                  { icon: CircleDollarSign, title: "Бесплатный доступ", text: "Все функции для каждого аккаунта" },
                  { icon: Download, title: "Контроль данных", text: "Экспорт CSV и удаление аккаунта" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-line bg-surface/50 p-3.5">
                    <item.icon size={16} className="text-brand-strong" />
                    <p className="mt-2 text-[12px] font-medium text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center justify-center border-t border-line bg-[#0b2b20] p-10 lg:border-l lg:border-t-0">
              <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, #1d4c39 1px, transparent 1px), linear-gradient(to bottom, #1d4c39 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
              <div className="relative w-full max-w-[300px] rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-[#6ee7b7]">
                    <LockKeyhole size={18} />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white">Защищённый доступ</p>
                    <p className="text-[10px] text-[#9dc7b4]">Проверка на каждом запросе</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {["Пользователь → свои операции", "Данные → только у владельца", "Пароли → безопасный хеш"].map((line) => (
                    <div key={line} className="flex items-center gap-2 text-[10px] text-[#c6e3d4]">
                      <Check size={11} className="text-[#6ee7b7]" /> {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-line bg-surface/40 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Вопросы</p>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.035em] text-ink sm:text-[36px]">
              Коротко о важном
            </h2>
          </div>
          <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
            {faqs.map((item) => (
              <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink">
                  {item.q}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                    <Plus size={13} />
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[13px] leading-6 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 pt-4 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#0b2b20] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, #24523e 1px, transparent 1px), linear-gradient(to bottom, #24523e 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)" }} />
          <div className="relative">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]">Начните сегодня</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[40px]">
              Наведите порядок в деньгах — без таблиц и лишнего стресса
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7 text-[#b6d6c7]">
              Создайте аккаунт, добавьте первую операцию и посмотрите, как складывается картина месяца.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
              <LinkButton href="/signup" size="lg" className="bg-[#6ee7b7] text-[#06231a] hover:bg-[#8ff0c8]">
                Создать аккаунт <ArrowRight size={16} />
              </LinkButton>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-5 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
                У меня есть аккаунт
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-[#8fb8a4]">Бесплатно навсегда · Без карты · Данные можно удалить в любой момент</p>
          </div>
        </div>
      </section>
    </div>
  );
}
