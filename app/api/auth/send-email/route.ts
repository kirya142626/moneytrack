import { NextResponse, type NextRequest } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { Webhook } from "standardwebhooks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EmailActionType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email"
  | "reauthentication"
  | "password_changed_notification"
  | "email_changed_notification"
  | "phone_changed_notification"
  | "identity_linked_notification"
  | "identity_unlinked_notification"
  | "mfa_factor_enrolled_notification"
  | "mfa_factor_unenrolled_notification";

type HookPayload = {
  user: {
    email?: string;
    new_email?: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type: EmailActionType;
    site_url?: string;
    token_new?: string;
    token_hash_new?: string;
    old_email?: string;
  };
};

type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

const SUBJECTS: Record<string, string> = {
  signup: "Подтвердите почту в MoneyTrack",
  invite: "Приглашение в MoneyTrack",
  magiclink: "Вход в MoneyTrack",
  recovery: "Сброс пароля MoneyTrack",
  email_change: "Подтвердите новую почту в MoneyTrack",
  email: "Подтвердите новую почту в MoneyTrack",
  reauthentication: "Код подтверждения MoneyTrack",
  password_changed_notification: "Пароль MoneyTrack изменён",
  email_changed_notification: "Почта MoneyTrack изменена",
  phone_changed_notification: "Телефон MoneyTrack изменён",
  identity_linked_notification: "Новый способ входа в MoneyTrack",
  identity_unlinked_notification: "Способ входа в MoneyTrack отвязан",
  mfa_factor_enrolled_notification: "Двухфакторная защита MoneyTrack включена",
  mfa_factor_unenrolled_notification: "Двухфакторная защита MoneyTrack отключена",
};

function appBaseUrl(fallback?: string): string {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim() || fallback?.trim() || "";
  return value.replace(/\/+$/, "");
}

function safeNext(redirectTo: string | undefined, fallback: string): string {
  if (!redirectTo) return fallback;
  try {
    const next = new URL(redirectTo).searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  } catch {
    // Ignore malformed redirect URLs and use the default route.
  }
  return fallback;
}

function confirmationUrl(baseUrl: string, tokenHash: string, type: EmailActionType, next: string): string {
  const url = new URL(`${baseUrl}/auth/callback`);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  url.searchParams.set("next", next);
  return url.toString();
}

function buildMessages(payload: HookPayload): MailMessage[] {
  const { user, email_data: data } = payload;
  const email = user.email?.trim();
  if (!email) throw new Error("Hook payload has no user email");

  const baseUrl = appBaseUrl(data.site_url);
  if (!baseUrl) throw new Error("Application URL is not configured");

  const subject = SUBJECTS[data.email_action_type] ?? "MoneyTrack";
  const next = safeNext(data.redirect_to, data.email_action_type === "recovery" ? "/reset-password" : "/dashboard");
  const text = (body: string) => `${body}\n\n— MoneyTrack\nЛичные финансы под контролем`;

  switch (data.email_action_type) {
    case "recovery": {
      if (!data.token_hash) throw new Error("Hook payload has no recovery token");
      const link = confirmationUrl(baseUrl, data.token_hash, "recovery", next);
      return [
        {
          to: email,
          subject,
          text: text(
            [
              "Вы запросили сброс пароля в MoneyTrack.",
              "",
              "Чтобы задать новый пароль, перейдите по ссылке:",
              link,
              "",
              "Ссылка действует ограниченное время и открывается один раз.",
              "Если вы не запрашивали сброс, просто проигнорируйте это письмо — пароль останется прежним.",
            ].join("\n"),
          ),
        },
      ];
    }
    case "signup":
    case "invite": {
      if (!data.token_hash) throw new Error("Hook payload has no confirmation token");
      const link = confirmationUrl(baseUrl, data.token_hash, data.email_action_type, next);
      const intro =
        data.email_action_type === "signup"
          ? "Спасибо за регистрацию в MoneyTrack."
          : "Вас пригласили в MoneyTrack.";
      return [
        {
          to: email,
          subject,
          text: text(
            [
              intro,
              "",
              "Чтобы подтвердить почту и завершить вход, перейдите по ссылке:",
              link,
              "",
              "Ссылка действует ограниченное время и открывается один раз.",
              "Если вы не запрашивали это письмо, просто проигнорируйте его.",
            ].join("\n"),
          ),
        },
      ];
    }
    case "magiclink":
    case "email": {
      if (!data.token_hash) throw new Error("Hook payload has no sign-in token");
      const link = confirmationUrl(baseUrl, data.token_hash, data.email_action_type, next);
      return [
        {
          to: email,
          subject,
          text: text(
            [
              "Чтобы войти в MoneyTrack, перейдите по ссылке:",
              link,
              "",
              "Ссылка действует ограниченное время и открывается один раз.",
              "Если вы не запрашивали вход, просто проигнорируйте это письмо.",
            ].join("\n"),
          ),
        },
      ];
    }
    case "email_change": {
      const messages: MailMessage[] = [];
      const currentEmail = email;
      const newEmail = user.new_email?.trim();
      const tokenForCurrent = data.token_hash_new;
      const tokenForNew = data.token_hash;

      if (tokenForCurrent) {
        messages.push({
          to: currentEmail,
          subject,
          text: text(
            [
              "Вы запросили смену почты в MoneyTrack.",
              "",
              "Чтобы подтвердить смену со стороны текущего адреса, перейдите по ссылке:",
              confirmationUrl(baseUrl, tokenForCurrent, "email_change", next),
              "",
              "Если вы не запрашивали смену почты, просто проигнорируйте это письмо.",
            ].join("\n"),
          ),
        });
      }
      if (tokenForNew) {
        const recipient = newEmail || currentEmail;
        messages.push({
          to: recipient,
          subject,
          text: text(
            [
              "Вы запросили смену почты в MoneyTrack.",
              "",
              "Чтобы подтвердить новый адрес, перейдите по ссылке:",
              confirmationUrl(baseUrl, tokenForNew, "email_change", next),
              "",
              "Если вы не запрашивали смену почты, просто проигнорируйте это письмо.",
            ].join("\n"),
          ),
        });
      }
      if (!messages.length) throw new Error("Hook payload has no email change token");
      return messages;
    }
    case "reauthentication": {
      if (!data.token) throw new Error("Hook payload has no verification code");
      return [
        {
          to: email,
          subject,
          text: text(
            [
              "Код подтверждения для действия в MoneyTrack:",
              "",
              data.token,
              "",
              "Код действует ограниченное время. Никому его не сообщайте.",
            ].join("\n"),
          ),
        },
      ];
    }
    default: {
      const explanation: Record<string, string> = {
        password_changed_notification: "Пароль вашего аккаунта MoneyTrack был изменён.",
        email_changed_notification: "Почта вашего аккаунта MoneyTrack была изменена.",
        phone_changed_notification: "Телефон вашего аккаунта MoneyTrack был изменён.",
        identity_linked_notification: "К аккаунту MoneyTrack добавлен новый способ входа.",
        identity_unlinked_notification: "От аккаунта MoneyTrack отвязан способ входа.",
        mfa_factor_enrolled_notification: "Для аккаунта MoneyTrack включена двухфакторная защита.",
        mfa_factor_unenrolled_notification: "Для аккаунта MoneyTrack отключена двухфакторная защита.",
      };
      const message = explanation[data.email_action_type];
      if (!message) throw new Error(`Unsupported email action: ${data.email_action_type}`);
      return [
        {
          to: email,
          subject,
          text: text([message, "", "Если это были не вы, немедленно смените пароль в настройках аккаунта."].join("\n")),
        },
      ];
    }
  }
}

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass || !Number.isFinite(port)) {
    throw new Error("SMTP is not configured");
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cachedTransport;
}

function fromAddress(): string {
  const configured = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "";
  if (!configured) throw new Error("SMTP sender is not configured");
  return configured.includes("<") ? configured : `MoneyTrack <${configured}>`;
}

async function sendViaRelay(message: MailMessage): Promise<void> {
  const relayUrl = process.env.MAIL_RELAY_URL?.trim();
  if (!relayUrl) throw new Error("MAIL_RELAY_URL is not configured");

  const response = await fetch(relayUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: message.to,
      subject: message.subject,
      text: message.text,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Relay ${response.status}: ${detail.slice(0, 300)}`);
  }
}

async function deliver(messages: MailMessage[]): Promise<void> {
  // Яндекс отклоняет SMTP-письма с IP Vercel, поэтому в production используется
  // Cloudflare Worker, который отправляет их со своей инфраструктуры.
  if (process.env.MAIL_RELAY_URL?.trim()) {
    for (const message of messages) await sendViaRelay(message);
    return;
  }

  const transport = getTransport();
  const from = fromAddress();
  for (const message of messages) {
    await transport.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      headers: { "X-Auto-Response-Suppress": "All" },
    });
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: { http_code: 500, message: "Email hook is not configured" } },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);
  const webhook = new Webhook(secret.replace(/^v1,whsec_/, ""));

  let data: HookPayload;
  try {
    data = webhook.verify(payload, headers) as HookPayload;
  } catch {
    return NextResponse.json(
      { error: { http_code: 401, message: "Invalid signature" } },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const messages = buildMessages(data);
    await deliver(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`[send-email-hook] ${data.email_data.email_action_type}: ${message}`);
    return NextResponse.json(
      { error: { http_code: 500, message: "Email delivery failed" } },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({}, { status: 200, headers: { "Cache-Control": "no-store" } });
}
