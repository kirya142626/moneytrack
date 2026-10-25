import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type DbGlobal = typeof globalThis & { __moneytrackDb?: DatabaseSync };

function databasePath(): string {
  const configured = process.env.MONEYTRACK_DB_PATH?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "moneytrack.db");
}

function open(): DatabaseSync {
  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrate(db);
  return db;
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'RUB',
      theme TEXT NOT NULL DEFAULT 'light',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      icon TEXT NOT NULL DEFAULT 'circle-ellipsis',
      color TEXT NOT NULL DEFAULT '#64748b',
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS categories_user_idx ON categories(user_id);

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      occurred_on TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, occurred_on DESC);

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS budgets_unique_idx
      ON budgets(user_id, month, IFNULL(category_id, '__overall__'));

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target_cents INTEGER NOT NULL CHECK (target_cents > 0),
      target_date TEXT,
      note TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#0e9f6e',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS goals_user_idx ON goals(user_id);

    CREATE TABLE IF NOT EXISTS goal_contributions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      occurred_on TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS contributions_user_idx ON goal_contributions(user_id);

    DROP TABLE IF EXISTS subscriptions;
  `);

  // Backfill categories added after the first release for existing local users.
  // Runs once: renamed standard categories must not be re-created on every start.
  const migrationId = "0002_free_categories";
  const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE id = ?").get(migrationId);
  if (applied) return;

  const addedCategories = [
    { name: "Маркетплейсы", icon: "store", color: "#a855f7" },
    { name: "Игры", icon: "gamepad-2", color: "#84cc16" },
  ];
  const users = db.prepare("SELECT id FROM users").all() as { id: string }[];
  const exists = db.prepare(
    "SELECT 1 FROM categories WHERE user_id = ? AND type = 'expense' AND name = ? LIMIT 1",
  );
  const insert = db.prepare(
    "INSERT INTO categories (id, user_id, name, type, icon, color, is_system, created_at) VALUES (?,?,?,?,?,?,1,?)",
  );
  for (const user of users) {
    for (const category of addedCategories) {
      if (!exists.get(user.id, category.name)) {
        insert.run(
          randomUUID(),
          user.id,
          category.name,
          "expense",
          category.icon,
          category.color,
          new Date().toISOString(),
        );
      }
    }
  }
  db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(
    migrationId,
    new Date().toISOString(),
  );
}

export function getDb(): DatabaseSync {
  const g = globalThis as DbGlobal;
  if (!g.__moneytrackDb) {
    g.__moneytrackDb = open();
  }
  return g.__moneytrackDb;
}
