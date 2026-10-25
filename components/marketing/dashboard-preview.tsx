import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Target,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";


export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-8 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_60%_30%,rgba(14,159,110,0.13),transparent_65%)]" />
      <div className="absolute -inset-px -z-10 translate-x-2 translate-y-3 rounded-2xl border border-line bg-surface" />

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-white shadow-[0_28px_80px_-30px_rgba(13,42,29,0.28)]">
        <div className="flex items-center justify-between border-b border-line bg-surface/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="text-[12px] font-semibold tracking-tight text-ink">MoneyTrack</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] text-muted">
            Октябрь 2026 <ChevronDown size={11} />
          </div>
        </div>

        <div className="flex">
          <div className="hidden w-[58px] shrink-0 flex-col items-center gap-4 border-r border-line bg-surface/30 py-4 sm:flex">
            {[LayoutDashboard, Wallet, Target, PiggyBank].map((Icon, index) => (
              <span
                key={index}
                className={
                  index === 0
                    ? "flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-strong"
                    : "flex h-8 w-8 items-center justify-center rounded-lg text-muted/70"
                }
              >
                <Icon size={15} />
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">Общий баланс</p>
                <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink tabular">
                  184 250 ₽
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[10px] font-medium text-brand-strong">
                <ArrowUpRight size={11} /> 12,4%
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-line bg-white p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Доходы
                </p>
                <p className="mt-1 text-[14px] font-semibold tracking-tight text-ink tabular">96 000 ₽</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Расходы
                </p>
                <p className="mt-1 text-[14px] font-semibold tracking-tight text-ink tabular">58 340 ₽</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-line p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-medium text-ink-soft">Движение средств</p>
                <p className="text-[9px] text-muted">Доходы / расходы</p>
              </div>
              <svg viewBox="0 0 300 74" className="h-[64px] w-full" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e9f6e" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#0e9f6e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 54 C22 50 30 36 52 40 C74 44 82 24 104 28 C126 32 134 18 156 22 C178 26 186 12 208 16 C230 20 240 8 262 12 C280 15 290 6 300 8 L300 74 L0 74 Z"
                  fill="url(#preview-fill)"
                />
                <path
                  d="M0 54 C22 50 30 36 52 40 C74 44 82 24 104 28 C126 32 134 18 156 22 C178 26 186 12 208 16 C230 20 240 8 262 12 C280 15 290 6 300 8"
                  fill="none"
                  stroke="#0e9f6e"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M0 64 C28 62 38 54 62 56 C88 58 96 46 120 48 C144 50 152 40 176 42 C200 44 208 34 232 36 C256 38 274 30 300 32"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>

            <div className="mt-3 grid grid-cols-[1.2fr_1fr] gap-2">
              <div className="rounded-xl border border-line p-3">
                <p className="text-[10px] font-medium text-ink-soft">Последние операции</p>
                <div className="mt-2 space-y-2">
                  {[
                    { name: "Продукты", amount: "−2 480 ₽", color: "#f97316", up: false },
                    { name: "Зарплата", amount: "+96 000 ₽", color: "#0e9f6e", up: true },
                    { name: "Кафе", amount: "−1 240 ₽", color: "#eab308", up: false },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: tx.color }} />
                        <span className="truncate text-[10px] text-ink-soft">{tx.name}</span>
                      </div>
                      <span
                        className={
                          tx.up
                            ? "shrink-0 text-[10px] font-medium text-brand-strong tabular"
                            : "shrink-0 text-[10px] font-medium text-ink-soft tabular"
                        }
                      >
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-[10px] font-medium text-ink-soft">Бюджет</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight text-ink tabular">58 340 ₽</p>
                <p className="text-[9px] text-muted">из 80 000 ₽</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full w-[73%] rounded-full bg-brand" />
                </div>
                <p className="mt-1.5 text-[9px] text-muted">73% использовано</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-4 bottom-14 hidden w-[156px] rounded-xl border border-line bg-white p-3 shadow-xl sm:block">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-brand-strong">
            <Target size={12} />
          </span>
          <span className="text-[10px] font-medium text-ink">Отпуск</span>
          <span className="ml-auto text-[10px] font-semibold text-brand-strong">68%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-[68%] rounded-full bg-brand" />
        </div>
        <p className="mt-1.5 text-[9px] text-muted">136 000 из 200 000 ₽</p>
      </div>

      <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 shadow-xl sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-500">
          <ArrowDownRight size={12} />
        </span>
        <div>
          <p className="text-[9px] text-muted">Расходы ниже</p>
          <p className="text-[10px] font-semibold text-ink">на 8,2% к сентябрю</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5">
          <Plus size={10} /> Пример интерфейса
        </span>
        <span>Демонстрационные данные</span>
      </div>
    </div>
  );
}
