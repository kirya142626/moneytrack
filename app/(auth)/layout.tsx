import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1fr_0.9fr]">
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo size={30} />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            На главную <ArrowUpRight size={13} />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <footer className="px-5 pb-6 text-center text-[11px] text-muted sm:px-8">
          Продолжая, вы соглашаетесь с{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            условиями
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            политикой конфиденциальности
          </Link>
          .
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#0a271c] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #2a5a45 1px, transparent 1px), linear-gradient(to bottom, #2a5a45 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at 30% 30%, black 10%, transparent 75%)",
          }}
        />
        <div className="relative p-10 xl:p-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#b8ddca]">
            <Sparkles size={12} className="text-[#6ee7b7]" />
            Личные финансы нового уровня
          </span>
          <h2 className="mt-7 max-w-md text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] text-white xl:text-[40px]">
            Ясность в деньгах начинается с одного взгляда.
          </h2>
          <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#a9cdbb]">
            Все доходы, расходы, бюджеты и цели — в одном месте. Без таблиц, случайных цифр и лишнего стресса.
          </p>
        </div>

        <div className="relative mx-8 mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm xl:mx-12 xl:mb-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8fb8a4]">Общий баланс</p>
              <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.04em] text-white tabular">184 250 ₽</p>
            </div>
            <span className="rounded-full bg-[#6ee7b7]/15 px-2 py-1 text-[10px] font-medium text-[#6ee7b7]">+12,4%</span>
          </div>
          <svg viewBox="0 0 320 70" className="mt-4 h-[70px] w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="auth-chart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 54 C24 50 32 34 56 38 C80 42 90 24 114 28 C138 32 148 16 172 20 C196 24 206 10 230 14 C254 18 268 6 292 10 C306 12 314 6 320 7 L320 70 L0 70 Z" fill="url(#auth-chart)" />
            <path d="M0 54 C24 50 32 34 56 38 C80 42 90 24 114 28 C138 32 148 16 172 20 C196 24 206 10 230 14 C254 18 268 6 292 10 C306 12 314 6 320 7" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
              <p className="text-[9px] text-[#8fb8a4]">Доходы</p>
              <p className="mt-0.5 text-[12px] font-semibold text-white tabular">96 000 ₽</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
              <p className="text-[9px] text-[#8fb8a4]">Расходы</p>
              <p className="mt-0.5 text-[12px] font-semibold text-white tabular">58 340 ₽</p>
            </div>
          </div>
        </div>

        <div className="relative flex gap-5 border-t border-white/10 px-10 py-5 text-[10px] text-[#8fb8a4] xl:px-14">
          {[
            { icon: ShieldCheck, text: "Защита данных" },
            { icon: Check, text: "Бесплатно навсегда" },
            { icon: Check, text: "Без рекламы" },
          ].map((item) => (
            <span key={item.text} className="inline-flex items-center gap-1.5">
              <item.icon size={11} className="text-[#6ee7b7]" /> {item.text}
            </span>
          ))}
        </div>
      </aside>
    </div>
  );
}
