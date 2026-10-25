export type TxType = "income" | "expense";
export type ThemeName = "light" | "dark" | "sand";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  theme: ThemeName;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TxType;
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  amountCents: number;
  categoryId: string | null;
  occurredOn: string;
  description: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  categoryId: string | null;
  amountCents: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetCents: number;
  targetDate: string | null;
  note: string;
  color: string;
  createdAt: string;
}

export interface Contribution {
  id: string;
  userId: string;
  goalId: string;
  amountCents: number;
  occurredOn: string;
  note: string;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  type: TxType;
  icon: string;
  color: string;
}

export interface TransactionInput {
  type: TxType;
  amountCents: number;
  categoryId: string | null;
  occurredOn: string;
  description: string;
}

export interface BudgetInput {
  month: string;
  categoryId: string | null;
  amountCents: number;
}

export interface GoalInput {
  name: string;
  targetCents: number;
  targetDate: string | null;
  note: string;
  color: string;
}

export interface ProfileInput {
  fullName?: string;
  currency?: string;
  theme?: ThemeName;
}

export type BackendMode = "local" | "supabase";

export interface Store {
  mode: BackendMode;
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, input: ProfileInput): Promise<void>;
  deleteAccount(userId: string): Promise<void>;

  listCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, input: CategoryInput): Promise<Category>;
  updateCategory(userId: string, id: string, input: CategoryInput): Promise<void>;
  deleteCategory(userId: string, id: string): Promise<void>;

  listTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(userId: string, input: TransactionInput): Promise<Transaction>;
  updateTransaction(userId: string, id: string, input: TransactionInput): Promise<void>;
  deleteTransaction(userId: string, id: string): Promise<void>;

  listBudgets(userId: string): Promise<Budget[]>;
  saveBudget(userId: string, input: BudgetInput): Promise<Budget>;
  deleteBudget(userId: string, id: string): Promise<void>;

  listGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, input: GoalInput): Promise<Goal>;
  updateGoal(userId: string, id: string, input: GoalInput): Promise<void>;
  deleteGoal(userId: string, id: string): Promise<void>;

  listContributions(userId: string): Promise<Contribution[]>;
  addContribution(
    userId: string,
    input: { goalId: string; amountCents: number; occurredOn: string; note: string },
  ): Promise<Contribution>;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
}
