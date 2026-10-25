import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";

  return (
    <div className="animate-fade-up">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">С возвращением</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink">Войдите в MoneyTrack</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">Продолжите с того места, где остановились.</p>
      <div className="mt-7">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
