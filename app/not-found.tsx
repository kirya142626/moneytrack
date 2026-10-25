import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo href="/" size={38} />
      <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.16em] text-brand">Ошибка 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">Такой страницы нет</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        Возможно, ссылка устарела или в адресе есть опечатка. Вернитесь на главную или откройте свою панель.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <LinkButton href="/" variant="outline">
          На главную
        </LinkButton>
        <LinkButton href="/dashboard">В панель</LinkButton>
      </div>
      <Link href="/features" className="mt-8 text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
        Посмотреть возможности
      </Link>
    </main>
  );
}
