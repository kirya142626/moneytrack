import { requireUser, getStore } from "@/lib/server/auth";
import { AppNav } from "@/components/app/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const store = getStore();
  const categories = await store.listCategories(user.id);

  return (
    <div data-theme={user.theme} className="min-h-dvh bg-canvas text-ink">
      <AppNav
        name={user.fullName}
        email={user.email}
        categories={categories}
        currency={user.currency}
      />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
