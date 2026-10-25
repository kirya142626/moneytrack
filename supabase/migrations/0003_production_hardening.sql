-- MoneyTrack · production hardening
-- Apply after 0001_init.sql and 0002_free_access.sql on existing projects.
-- New projects can run 0001 → 0002 → 0003 in order; the script is idempotent.

-- ---------------------------------------------------------------------------
-- 1. Transactions may only reference categories owned by the same user
-- ---------------------------------------------------------------------------

drop policy if exists "transactions_all_own" on public.transactions;
create policy "transactions_all_own" on public.transactions
  for all using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = transactions.category_id
          and c.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Category seeding is a trigger-only operation
-- ---------------------------------------------------------------------------

revoke all on function public.seed_default_categories(uuid) from public;
revoke all on function public.seed_default_categories(uuid) from anon, authenticated;
