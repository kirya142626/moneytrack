import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { createSupabaseServerClient } from "@/lib/server/supabase/client";
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

type Row = Record<string, unknown>;
const str = (v: unknown): string => (v == null ? "" : String(v));
const num = (v: unknown): number => Number(v ?? 0);

function fail(context: string, error: { message?: string } | null): never {
  console.error(`[MoneyTrack][supabase] ${context}:`, error?.message);
  throw new Error("Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз");
}

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

/** Creates profile and default categories if the DB trigger is missing. */
export async function ensureSupabaseUserData(userId: string, email: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    await supabase.from("profiles").insert({ id: userId, email, full_name: "", currency: "RUB", theme: "light" });
  }
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (!count) {
    await supabase.from("categories").insert(
      DEFAULT_CATEGORIES.map((c) => ({
        user_id: userId,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        is_system: true,
      })),
    );
  }
}

export function supabaseStore(): Store {
  return {
    mode: "supabase",

    async getProfile(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) fail("getProfile", error);
      return data ? mapProfile(data as Row) : null;
    },

    async updateProfile(userId, input: ProfileInput) {
      const supabase = await createSupabaseServerClient();
      const patch: Row = {};
      if (input.fullName !== undefined) patch.full_name = input.fullName;
      if (input.currency !== undefined) patch.currency = input.currency;
      if (input.theme !== undefined) patch.theme = input.theme;
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) fail("updateProfile", error);
    },

    async deleteAccount() {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.rpc("delete_own_account");
      if (error) fail("deleteAccount", error);
    },

    async listCategories(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("type", { ascending: true })
        .order("is_system", { ascending: false })
        .order("name", { ascending: true });
      if (error) fail("listCategories", error);
      return (data ?? []).map((r) => mapCategory(r as Row));
    },

    async createCategory(userId, input: CategoryInput) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: userId,
          name: input.name.trim(),
          type: input.type,
          icon: input.icon,
          color: input.color,
          is_system: false,
        })
        .select("*")
        .single();
      if (error) fail("createCategory", error);
      return mapCategory(data as Row);
    },

    async updateCategory(userId, id, input: CategoryInput) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("categories")
        .update({ name: input.name.trim(), type: input.type, icon: input.icon, color: input.color })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) fail("updateCategory", error);
    },

    async deleteCategory(userId, id) {
      const supabase = await createSupabaseServerClient();
      const { data: cat, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      if (catError) fail("deleteCategory", catError);
      if (!cat) throw new Error("Категория не найдена");
      if (Boolean((cat as Row).is_system)) {
        throw new Error("Стандартную категорию удалить нельзя — её можно переименовать");
      }
      const { count, error: countError } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("category_id", id);
      if (countError) fail("deleteCategory:count", countError);
      if ((count ?? 0) > 0) {
        throw new Error("В категории есть операции. Сначала перенесите их в другую категорию");
      }
      const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", userId);
      if (error) fail("deleteCategory", error);
    },

    async listTransactions(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) fail("listTransactions", error);
      return (data ?? []).map((r) => mapTransaction(r as Row));
    },

    async createTransaction(userId, input: TransactionInput) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: input.type,
          amount_cents: input.amountCents,
          category_id: input.categoryId,
          occurred_on: input.occurredOn,
          description: input.description.trim(),
        })
        .select("*")
        .single();
      if (error) fail("createTransaction", error);
      return mapTransaction(data as Row);
    },

    async updateTransaction(userId, id, input: TransactionInput) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("transactions")
        .update({
          type: input.type,
          amount_cents: input.amountCents,
          category_id: input.categoryId,
          occurred_on: input.occurredOn,
          description: input.description.trim(),
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) fail("updateTransaction", error);
    },

    async deleteTransaction(userId, id) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
      if (error) fail("deleteTransaction", error);
    },

    async listBudgets(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .order("month", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) fail("listBudgets", error);
      return (data ?? []).map((r) => mapBudget(r as Row));
    },

    async saveBudget(userId, input: BudgetInput) {
      const supabase = await createSupabaseServerClient();
      const month = normalizeMonth(input.month);
      let query = supabase.from("budgets").select("*").eq("user_id", userId).eq("month", month);
      query = input.categoryId ? query.eq("category_id", input.categoryId) : query.is("category_id", null);
      const { data: existing, error: findError } = await query.maybeSingle();
      if (findError) fail("saveBudget:find", findError);
      if (existing) {
        const { data, error } = await supabase
          .from("budgets")
          .update({ amount_cents: input.amountCents })
          .eq("id", str((existing as Row).id))
          .select("*")
          .single();
        if (error) fail("saveBudget:update", error);
        return mapBudget(data as Row);
      }
      const { data, error } = await supabase
        .from("budgets")
        .insert({
          user_id: userId,
          month,
          category_id: input.categoryId,
          amount_cents: input.amountCents,
        })
        .select("*")
        .single();
      if (error) fail("saveBudget:insert", error);
      return mapBudget(data as Row);
    },

    async deleteBudget(userId, id) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", userId);
      if (error) fail("deleteBudget", error);
    },

    async listGoals(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) fail("listGoals", error);
      return (data ?? []).map((r) => mapGoal(r as Row));
    },

    async createGoal(userId, input: GoalInput) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          name: input.name.trim(),
          target_cents: input.targetCents,
          target_date: input.targetDate,
          note: input.note.trim(),
          color: input.color,
        })
        .select("*")
        .single();
      if (error) fail("createGoal", error);
      return mapGoal(data as Row);
    },

    async updateGoal(userId, id, input: GoalInput) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("goals")
        .update({
          name: input.name.trim(),
          target_cents: input.targetCents,
          target_date: input.targetDate,
          note: input.note.trim(),
          color: input.color,
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) fail("updateGoal", error);
    },

    async deleteGoal(userId, id) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", userId);
      if (error) fail("deleteGoal", error);
    },

    async listContributions(userId) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("goal_contributions")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) fail("listContributions", error);
      return (data ?? []).map((r) => mapContribution(r as Row));
    },

    async addContribution(userId, input) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("goal_contributions")
        .insert({
          user_id: userId,
          goal_id: input.goalId,
          amount_cents: input.amountCents,
          occurred_on: input.occurredOn,
          note: input.note.trim(),
        })
        .select("*")
        .single();
      if (error) fail("addContribution", error);
      return mapContribution(data as Row);
    },
  };
}
