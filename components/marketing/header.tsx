import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LinkButton } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-8">
          <Logo size={30} />
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
              Возможности
            </Link>
            <Link href="/features" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
              Все функции
            </Link>
            <Link href="/#security" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
              Безопасность
            </Link>
            <Link href="/#faq" className="text-[13px] font-medium text-muted transition-colors hover:text-ink">
              Вопросы
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            Войти
          </Link>
          <LinkButton href="/signup" size="sm" className="h-9 px-3.5">
            Начать бесплатно
            <ArrowRight size={14} className="hidden sm:block" />
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
