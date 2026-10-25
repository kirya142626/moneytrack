import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/server/local/db";
import type {
  Budget,
  BudgetInput,
  Category,
  CategoryInput,
  Contribution,
  Goal,
  GoalInput,
  Profile,
  ProfileInput,
  Store,
  Transaction,
  TransactionInput,
} from "@/lib/types";
import { monthLabel } from "@/lib/date";

type Row = Record<string, unknown>;

const now = () => new Date().toISOString();
const str = (v: unknown): string => (v == null ? "" : String(v));
const num = (v: unknown): number => Number(v ?? 0);

function mapProfile(r: Row): Profile {
  return {
    id: str(r.id),
    email: str(r.email),
    fullName: str(r.full_name),
    currency: str(r.currency) || "RUB",
    theme: (str(r.theme) || "light") as Profile["theme"],
    createdAt: str(r.created_at),
  };
}
function mapCategory(r: Row): Category {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    name: str(r.name),
    type: str(r.type) as Category["type"],
    icon: str(r.icon),
    color: str(r.color),
    isSystem: Boolean(r.is_system),
    createdAt: str(r.created_at),
  };
}
function mapTransaction(r: Row): Transaction {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    type: str(r.type) as Transaction["type"],
    amountCents: num(r.amount_cents),
    categoryId: r.category_id ? str(r.category_id) : null,
    occurredOn: str(r.occurred_on).slice(0, 10),
    description: str(r.description),
    createdAt: str(r.created_at),
  };
}
function mapBudget(r: Row): Budget {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    month: str(r.month).slice(0, 10),
    categoryId: r.category_id ? str(r.category_id) : null,
    amountCents: num(r.amount_cents),
    createdAt: str(r.created_at),
  };
}
function mapGoal(r: Row): Goal {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    name: str(r.name),
    targetCents: num(r.target_cents),
    targetDate: r.target_date ? str(r.target_date).slice(0, 10) : null,
    note: str(r.note),
    color: str(r.color),
    createdAt: str(r.created_at),
  };
}
function mapContribution(r: Row): Contribution {
  return {
    id: str(r.id),
    userId: str(r.user_id),
    goalId: str(r.goal_id),
    amountCents: num(r.amount_cents),
    occurredOn: str(r.occurred_on).slice(0, 10),
    note: str(r.note),
    createdAt: str(r.created_at),
  };
}
function normalizeMonth(month: string): string {
  return `${month.slice(0, 7)}-01`;
}

export function localStore(): Store {
  const db = getDb();
  return {
    mode: "local",

    async getProfile(userId) {
      const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as Row | undefined;
      return row ? mapProfile(row) : null;
    },

    async updateProfile(userId, input: ProfileInput) {
      const current = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as Row | undefined;
      if (!current) throw new Error("Профиль не найден");
      db.prepare("UPDATE profiles SET full_name = ?, currency = ?, theme = ? WHERE id = ?").run(
        input.fullName ?? str(current.full_name),
        input.currency ?? str(current.currency),
        input.theme ?? str(current.theme),
        userId,
      );
    },

    async deleteAccount(userId) {
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    },

    async listCategories(userId) {
      const rows = db
        .prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY type ASC, is_system DESC, name ASC")
        .all(userId) as Row[];
      return rows.map(mapCategory);
    },

    async createCategory(userId, input: CategoryInput) {
      const id = randomUUID();
      db.prepare(
        "INSERT INTO categories (id, user_id, name, type, icon, color, is_system, created_at) VALUES (?,?,?,?,?,?,0,?)",
      ).run(id, userId, input.name.trim(), input.type, input.icon, input.color, now());
      const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Row;
      return mapCategory(row);
    },

    async updateCategory(userId, id, input: CategoryInput) {
      const result = db
        .prepare("UPDATE categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?")
        .run(input.name.trim(), input.type, input.icon, input.color, id, userId);
      if (Number(result.changes) === 0) throw new Error("Категория не найдена");
    },

    async deleteCategory(userId, id) {
      const row = db.prepare("SELECT * FROM categories WHERE id = ? AND user_id = ?").get(id, userId) as Row | undefined;
      if (!row) throw new Error("Категория не найдена");
      if (Boolean(row.is_system)) throw new Error("Стандартную категорию удалить нельзя — её можно переименовать");
      const used = db
        .prepare("SELECT COUNT(*) AS c FROM transactions WHERE user_id = ? AND category_id = ?")
        .get(userId, id) as Row;
      if (num(used.c) > 0) throw new Error("В категории есть операции. Сначала перенесите их в другую категорию");
      db.prepare("DELETE FROM categories WHERE id = ? AND user_id = ?").run(id, userId);
    },

    async listTransactions(userId) {
      const rows = db
        .prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY occurred_on DESC, created_at DESC")
        .all(userId) as Row[];
      return rows.map(mapTransaction);
    },

    async createTransaction(userId, input: TransactionInput) {
      const id = randomUUID();
      db.prepare(
        "INSERT INTO transactions (id, user_id, type, amount_cents, category_id, occurred_on, description, created_at) VALUES (?,?,?,?,?,?,?,?)",
      ).run(
        id,
        userId,
        input.type,
        input.amountCents,
        input.categoryId,
        input.occurredOn,
        input.description.trim(),
        now(),
      );
      const row = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as Row;
      return mapTransaction(row);
    },

    async updateTransaction(userId, id, input: TransactionInput) {
      const result = db
        .prepare(
          "UPDATE transactions SET type = ?, amount_cents = ?, category_id = ?, occurred_on = ?, description = ? WHERE id = ? AND user_id = ?",
        )
        .run(
          input.type,
          input.amountCents,
          input.categoryId,
          input.occurredOn,
          input.description.trim(),
          id,
          userId,
        );
      if (Number(result.changes) === 0) throw new Error("Операция не найдена");
    },

    async deleteTransaction(userId, id) {
      const result = db.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?").run(id, userId);
      if (Number(result.changes) === 0) throw new Error("Операция не найдена");
    },

    async listBudgets(userId) {
      const rows = db
        .prepare("SELECT * FROM budgets WHERE user_id = ? ORDER BY month DESC, created_at ASC")
        .all(userId) as Row[];
      return rows.map(mapBudget);
    },

    async saveBudget(userId, input: BudgetInput) {
      const month = normalizeMonth(input.month);
      const existing = db
        .prepare(
          "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND IFNULL(category_id,'__overall__') = ?",
        )
        .get(userId, month, input.categoryId ?? "__overall__") as Row | undefined;
      if (existing) {
        db.prepare("UPDATE budgets SET amount_cents = ? WHERE id = ? AND user_id = ?").run(
          input.amountCents,
          str(existing.id),
          userId,
        );
        return mapBudget({ ...existing, amount_cents: input.amountCents });
      }
      const id = randomUUID();
      db.prepare(
        "INSERT INTO budgets (id, user_id, month, category_id, amount_cents, created_at) VALUES (?,?,?,?,?,?)",
      ).run(id, userId, month, input.categoryId, input.amountCents, now());
      const row = db.prepare("SELECT * FROM budgets WHERE id = ?").get(id) as Row;
      return mapBudget(row);
    },

    async deleteBudget(userId, id) {
      const result = db.prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?").run(id, userId);
      if (Number(result.changes) === 0) throw new Error("Бюджет не найден");
    },

    async listGoals(userId) {
      const rows = db
        .prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC")
        .all(userId) as Row[];
      return rows.map(mapGoal);
    },

    async createGoal(userId, input: GoalInput) {
      const id = randomUUID();
      db.prepare(
        "INSERT INTO goals (id, user_id, name, target_cents, target_date, note, color, created_at) VALUES (?,?,?,?,?,?,?,?)",
      ).run(
        id,
        userId,
        input.name.trim(),
        input.targetCents,
        input.targetDate,
        input.note.trim(),
        input.color,
        now(),
      );
      const row = db.prepare("SELECT * FROM goals WHERE id = ?").get(id) as Row;
      return mapGoal(row);
    },

    async updateGoal(userId, id, input: GoalInput) {
      const result = db
        .prepare(
          "UPDATE goals SET name = ?, target_cents = ?, target_date = ?, note = ?, color = ? WHERE id = ? AND user_id = ?",
        )
        .run(
          input.name.trim(),
          input.targetCents,
          input.targetDate,
          input.note.trim(),
          input.color,
          id,
          userId,
        );
      if (Number(result.changes) === 0) throw new Error("Цель не найдена");
    },

    async deleteGoal(userId, id) {
      const result = db.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").run(id, userId);
      if (Number(result.changes) === 0) throw new Error("Цель не найдена");
    },

    async listContributions(userId) {
      const rows = db
        .prepare("SELECT * FROM goal_contributions WHERE user_id = ? ORDER BY occurred_on DESC, created_at DESC")
        .all(userId) as Row[];
      return rows.map(mapContribution);
    },

    async addContribution(userId, input) {
      const goal = db.prepare("SELECT id FROM goals WHERE id = ? AND user_id = ?").get(input.goalId, userId);
      if (!goal) throw new Error("Цель не найдена");
      const id = randomUUID();
      db.prepare(
        "INSERT INTO goal_contributions (id, user_id, goal_id, amount_cents, occurred_on, note, created_at) VALUES (?,?,?,?,?,?,?)",
      ).run(id, userId, input.goalId, input.amountCents, input.occurredOn, input.note.trim(), now());
      const row = db.prepare("SELECT * FROM goal_contributions WHERE id = ?").get(id) as Row;
      return mapContribution(row);
    },
  };
}

export function seedLocalCategories(userId: string, categories: { name: string; type: string; icon: string; color: string }[]): void {
  const db = getDb();
  const insert = db.prepare(
    "INSERT INTO categories (id, user_id, name, type, icon, color, is_system, created_at) VALUES (?,?,?,?,?,?,1,?)",
  );
  for (const cat of categories) {
    insert.run(randomUUID(), userId, cat.name, cat.type, cat.icon, cat.color, now());
  }
}

export function describeStoreError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Не удалось выполнить действие. Попробуйте ещё раз";
}

export function monthHuman(month: string): string {
  return monthLabel(month);
}
