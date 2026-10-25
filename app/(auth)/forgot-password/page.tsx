import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Восстановление пароля" };

export default function ForgotPasswordPage() {
  return (
    <div className="animate-fade-up">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">Восстановление доступа</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink">Забыли пароль?</h1>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Укажите почту, на которую зарегистрирован аккаунт. Мы отправим ссылку для создания нового пароля.
      </p>
      <div className="mt-7">
        <ForgotForm />
      </div>
    </div>
  );
}
