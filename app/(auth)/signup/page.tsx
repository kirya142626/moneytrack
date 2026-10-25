import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Регистрация" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="animate-fade-up">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Бесплатно навсегда</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink">Создайте аккаунт</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Наведите порядок в деньгах за пару минут. Все возможности включены, карта не нужна.
      </p>
      <div className="mt-7">
        <SignupForm next="/dashboard" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface/60 p-3">
        {["Все функции без лимитов", "19 категорий", "Аналитика за любой период", "Три темы"].map((item) => (
          <span key={item} className="flex items-center gap-1.5 text-[10px] leading-4 text-muted">
            <Check size={11} className="shrink-0 text-brand" /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}
