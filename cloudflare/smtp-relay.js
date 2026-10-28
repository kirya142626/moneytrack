/**
 * MoneyTrack: SMTP relay Cloudflare Worker.
 *
 * Принимает POST /send/<token> с JSON { to, subject, text } и отправляет письмо
 * через Яндекс SMTP по implicit TLS (порт 465). Нужен потому, что Яндекс
 * отклоняет письма с IP-адресов Vercel как спам.
 *
 * Protected by:
 * - RELAY_HASH: SHA-256 от токена в пути (сам токен хранится только в Vercel).
 * - SMTP_PASS: секрет Cloudflare, пароль приложения Яндекса.
 *
 * Bindings:
 *   SMTP_USER   plain text  y4kun1n.k@yandex.ru
 *   SMTP_FROM   plain text  y4kun1n.k@yandex.ru
 *   RELAY_HASH  plain text  SHA-256 hex от токена
 *   SMTP_PASS   secret      пароль приложения Яндекса
 */

import { connect } from "cloudflare:sockets";

const SMTP_HOST = "smtp.yandex.ru";
const SMTP_PORT = 465;
const EHLO_HOST = "moneytrack.kyakunin896.workers.dev";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function utf8ToBase64(value) {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function wrapBase64(value) {
  return utf8ToBase64(value).replace(/(.{76})/g, "$1\r\n");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildMessage({ from, to, subject, text }) {
  const domain = from.split("@")[1] || "moneytrack.local";
  const messageId = `<${crypto.randomUUID()}@${domain}>`;
  const encodedSubject = `=?UTF-8?B?${utf8ToBase64(subject)}?=`;
  return [
    `From: "MoneyTrack" <${from}>`,
    `To: <${to}>`,
    `Subject: ${encodedSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "X-Auto-Response-Suppress: All",
    "",
    wrapBase64(text),
  ].join("\r\n");
}

class SmtpSession {
  constructor(socket) {
    this.writer = socket.writable.getWriter();
    this.reader = socket.readable.getReader();
    this.buffer = "";
  }

  async readResponse() {
    let output = "";
    for (;;) {
      const lineEnd = this.buffer.indexOf("\r\n");
      if (lineEnd === -1) {
        const { value, done } = await this.reader.read();
        if (done) return `${output}[[connection closed]]`;
        this.buffer += decoder.decode(value, { stream: true });
        continue;
      }
      const line = this.buffer.slice(0, lineEnd);
      this.buffer = this.buffer.slice(lineEnd + 2);
      output += `${line}\n`;
      if (/^\d{3}-/.test(line)) continue;
      return output;
    }
  }

  async command(line) {
    await this.writer.write(encoder.encode(`${line}\r\n`));
    return this.readResponse();
  }

  async writeRaw(value) {
    await this.writer.write(encoder.encode(value));
  }

  async close() {
    try {
      await this.reader.cancel();
    } catch {
      // ignore
    }
    try {
      await this.writer.close();
    } catch {
      // ignore
    }
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true });
    }

    if (!url.pathname.startsWith("/send/")) {
      return json({ error: "not found" }, 404);
    }

    if (request.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const token = url.pathname.slice("/send/".length);
    const expectedHash = env.RELAY_HASH || "";
    if (!token || !expectedHash || (await sha256Hex(token)) !== expectedHash) {
      return json({ error: "forbidden" }, 403);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }

    const to = typeof payload?.to === "string" ? payload.to.trim() : "";
    const subject = typeof payload?.subject === "string" ? payload.subject.trim() : "";
    const text = typeof payload?.text === "string" ? payload.text : "";
    if (!to || !to.includes("@") || !subject || !text) {
      return json({ error: "missing or invalid fields" }, 400);
    }

    const user = env.SMTP_USER || "";
    const from = env.SMTP_FROM || user;
    const pass = env.SMTP_PASS || "";
    if (!user || !pass || !from) {
      return json({ error: "smtp is not configured" }, 500);
    }

    let socket;
    let step = "connect";
    try {
      socket = connect(
        { hostname: SMTP_HOST, port: SMTP_PORT },
        { secureTransport: "on" },
      );
      const smtp = new SmtpSession(socket);

      step = "greeting";
      const greeting = await smtp.readResponse();
      if (!greeting.startsWith("220")) throw new Error(`greeting: ${greeting.trim()}`);

      step = "ehlo";
      const ehlo = await smtp.command(`EHLO ${EHLO_HOST}`);
      if (!ehlo.startsWith("250")) throw new Error(`ehlo: ${ehlo.trim()}`);

      step = "auth";
      const auth = await smtp.command("AUTH LOGIN");
      if (!auth.startsWith("334")) throw new Error(`auth: ${auth.trim()}`);

      step = "username";
      const username = await smtp.command(utf8ToBase64(user));
      if (!username.startsWith("334")) throw new Error(`username: ${username.trim()}`);

      step = "password";
      const password = await smtp.command(utf8ToBase64(pass));
      if (!password.startsWith("235")) throw new Error(`password: ${password.trim()}`);

      step = "mail-from";
      const mailFrom = await smtp.command(`MAIL FROM:<${from}>`);
      if (!mailFrom.startsWith("250")) throw new Error(`mail-from: ${mailFrom.trim()}`);

      step = "rcpt-to";
      const rcptTo = await smtp.command(`RCPT TO:<${to}>`);
      if (!rcptTo.startsWith("250") && !rcptTo.startsWith("251")) {
        throw new Error(`rcpt-to: ${rcptTo.trim()}`);
      }

      step = "data";
      const data = await smtp.command("DATA");
      if (!data.startsWith("354")) throw new Error(`data: ${data.trim()}`);

      step = "message";
      const message = buildMessage({ from, to, subject, text });
      await smtp.writeRaw(`${message}\r\n.\r\n`);
      const accepted = await smtp.readResponse();
      if (!accepted.startsWith("250")) throw new Error(`message: ${accepted.trim()}`);

      step = "quit";
      await smtp.command("QUIT").catch(() => "");
      await smtp.close();

      return json({ ok: true });
    } catch (error) {
      try {
        if (socket) {
          const smtp = new SmtpSession(socket);
          await smtp.command("QUIT").catch(() => "");
          await smtp.close();
        }
      } catch {
        // ignore cleanup errors
      }
      return json(
        {
          error: error instanceof Error ? error.message : String(error),
          step,
        },
        502,
      );
    }
  },
};

export default worker;
