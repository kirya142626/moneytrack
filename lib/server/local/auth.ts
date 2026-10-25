import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { getDb } from "@/lib/server/local/db";
import { seedLocalCategories } from "@/lib/server/local/store";
import type { Profile } from "@/lib/types";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "mt_session";
const SESSION_DAYS = 30;

type Row = Record<string, unknown>;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function mapProfile(row: Row): Profile {
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name ?? ""),
    currency: String(row.currency ?? "RUB"),
    theme: (String(row.theme ?? "light") as Profile["theme"]) ?? "light",
    createdAt: String(row.created_at),
  };
}

async function createSession(userId: string): Promise<void> {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?,?,?,?)").run(
    sha256(token),
    userId,
    expires.toISOString(),
    new Date().toISOString(),
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearLocalSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getLocalUser(): Promise<Profile | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT p.*, s.expires_at AS session_expires
       FROM sessions s
       JOIN profiles p ON p.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(sha256(token)) as Row | undefined;
  if (!row) return null;
  if (String(row.session_expires) < new Date().toISOString()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
    return null;
  }
  return mapProfile(row);
}

export async function signUpLocal(
  fullName: string,
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string; message?: string }> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalized);
  if (existing) return { ok: false, error: "Аккаунт с такой почтой уже существует" };

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  try {
    db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?,?,?,?)").run(
      id,
      normalized,
      passwordHash,
      createdAt,
    );
    db.prepare(
      "INSERT INTO profiles (id, email, full_name, currency, theme, created_at) VALUES (?,?,?,?,?,?)",
    ).run(
      id,
      normalized,
      fullName.trim(),
      "RUB",
      "light",
      createdAt,
    );
    seedLocalCategories(id, DEFAULT_CATEGORIES);
    await createSession(id);
  } catch {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return { ok: false, error: "Не удалось создать аккаунт. Попробуйте ещё раз" };
  }
  return { ok: true, message: "Аккаунт создан" };
}

export async function signInLocal(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.password_hash FROM users u WHERE u.email = ?`,
    )
    .get(email.trim().toLowerCase()) as Row | undefined;
  if (!row) return { ok: false, error: "Неверная почта или пароль" };
  const valid = await verifyPassword(password, String(row.password_hash));
  if (!valid) return { ok: false, error: "Неверная почта или пароль" };
  await createSession(String(row.id));
  return { ok: true };
}

export async function requestPasswordResetLocal(
  email: string,
): Promise<{ ok: boolean; message: string; resetLink?: string }> {
  const db = getDb();
  const row = db.prepare("SELECT id FROM users WHERE email = ?").get(email.trim().toLowerCase()) as Row | undefined;
  const generic = "Если аккаунт с такой почтой существует, мы отправили ссылку для сброса пароля.";
  if (!row) return { ok: true, message: generic };

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 3_600_000).toISOString();
  db.prepare("INSERT INTO password_resets (token_hash, user_id, expires_at, used, created_at) VALUES (?,?,?,0,?)").run(
    sha256(token),
    String(row.id),
    expires,
    new Date().toISOString(),
  );
  const link = `/reset-password?token=${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.info(`[MoneyTrack] Ссылка для сброса пароля: ${link}`);
    return {
      ok: true,
      message: "Локальный режим: письма не отправляются. Ссылка для сброса готова.",
      resetLink: link,
    };
  }
  return { ok: true, message: generic };
}

export async function resetPasswordLocal(
  token: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT * FROM password_resets WHERE token_hash = ? AND used = 0",
    )
    .get(sha256(token)) as Row | undefined;
  if (!row) return { ok: false, error: "Ссылка недействительна или уже использована" };
  if (String(row.expires_at) < new Date().toISOString()) {
    return { ok: false, error: "Срок действия ссылки истёк. Запросите новую" };
  }
  const hash = await hashPassword(password);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, String(row.user_id));
  db.prepare("UPDATE password_resets SET used = 1 WHERE token_hash = ?").run(sha256(token));
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(String(row.user_id));
  return { ok: true };
}

export async function changePasswordLocal(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as Row | undefined;
  if (!row) return { ok: false, error: "Пользователь не найден" };
  const valid = await verifyPassword(currentPassword, String(row.password_hash));
  if (!valid) return { ok: false, error: "Текущий пароль указан неверно" };
  const hash = await hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, userId);
  return { ok: true };
}
