import { revalidatePath } from "next/cache";
import { getCurrentUser, getStore } from "@/lib/server/auth";
import type { Category, Profile, Store } from "@/lib/types";

export interface AppContext {
  user: Profile;
  store: Store;
}

export async function getAppContext(): Promise<AppContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user, store: getStore() };
}

export function revalidateFinance(): void {
  for (const path of [
    "/dashboard",
    "/transactions",
    "/analytics",
    "/budgets",
    "/goals",
    "/categories",
    "/settings",
  ]) {
    revalidatePath(path);
  }
}

export async function findOwnedCategory(
  store: Store,
  userId: string,
  categoryId: string,
): Promise<Category | null> {
  const categories = await store.listCategories(userId);
  return categories.find((c) => c.id === categoryId) ?? null;
}
