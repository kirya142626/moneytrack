-- MoneyTrack · Supabase schema
-- Run this migration in Supabase SQL Editor or with `supabase db push`.
-- Tables are protected with Row Level Security: each user can only touch own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  currency text not null default 'RUB',
  theme text not null default 'light' check (theme in ('light', 'dark', 'sand')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'circle-ellipsis',
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists categories_user_idx on public.categories (user_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount_cents bigint not null check (amount_cents > 0),
  category_id uuid references public.categories (id) on delete set null,
  occurred_on date not null,
  description text not null default '' check (char_length(description) <= 400),
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions (user_id, occurred_on desc);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  category_id uuid references public.categories (id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);
create unique index if not exists budgets_unique_idx
  on public.budgets (user_id, month, coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists budgets_user_idx on public.budgets (user_id, month desc);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  target_cents bigint not null check (target_cents > 0),
  target_date date,
  note text not null default '' check (char_length(note) <= 600),
  color text not null default '#0e9f6e' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now()
);
create index if not exists goals_user_idx on public.goals (user_id);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  occurred_on date not null,
  note text not null default '' check (char_length(note) <= 400),
  created_at timestamptz not null default now()
);
create index if not exists contributions_user_idx on public.goal_contributions (user_id, occurred_on desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

-- Profiles: a user can read/update only own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- Categories.
drop policy if exists "categories_all_own" on public.categories;
create policy "categories_all_own" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Transactions: only categories of the same user can be attached.
drop policy if exists "transactions_all_own" on public.transactions;
create policy "transactions_all_own" on public.transactions
  for all using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = transactions.category_id and c.user_id = auth.uid()
      )
    )
  );

-- Budgets: only categories of the same user can be attached.
drop policy if exists "budgets_all_own" on public.budgets;
create policy "budgets_all_own" on public.budgets
  for all using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and (
      category_id is null
      or exists (
        select 1 from public.categories c
        where c.id = budgets.category_id and c.user_id = auth.uid()
      )
    )
  );

-- Goals.
drop policy if exists "goals_all_own" on public.goals;
create policy "goals_all_own" on public.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Contributions: only to own goals.
drop policy if exists "contributions_all_own" on public.goal_contributions;
create policy "contributions_all_own" on public.goal_contributions
  for all using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.goals g
      where g.id = goal_contributions.goal_id and g.user_id = auth.uid()
    )
  );

-- Subscriptions are no longer part of MoneyTrack: all features are free.

-- ---------------------------------------------------------------------------
-- Profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.seed_default_categories(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, icon, color, is_system) values
    (target_user, 'Зарплата', 'income', 'briefcase', '#0e9f6e', true),
    (target_user, 'Фриланс', 'income', 'laptop', '#0ea5e9', true),
    (target_user, 'Инвестиции', 'income', 'trending-up', '#8b5cf6', true),
    (target_user, 'Подарки', 'income', 'gift', '#ec4899', true),
    (target_user, 'Другое', 'income', 'circle-ellipsis', '#64748b', true),
    (target_user, 'Продукты', 'expense', 'shopping-cart', '#f97316', true),
    (target_user, 'Кафе и рестораны', 'expense', 'utensils', '#eab308', true),
    (target_user, 'Жильё', 'expense', 'home', '#0e9f6e', true),
    (target_user, 'Транспорт', 'expense', 'car', '#3b82f6', true),
    (target_user, 'Здоровье', 'expense', 'heart-pulse', '#ef4444', true),
    (target_user, 'Образование', 'expense', 'graduation-cap', '#8b5cf6', true),
    (target_user, 'Развлечения', 'expense', 'clapperboard', '#ec4899', true),
    (target_user, 'Игры', 'expense', 'gamepad-2', '#84cc16', true),
    (target_user, 'Покупки', 'expense', 'shopping-bag', '#06b6d4', true),
    (target_user, 'Маркетплейсы', 'expense', 'store', '#a855f7', true),
    (target_user, 'Связь и интернет', 'expense', 'smartphone', '#14b8a6', true),
    (target_user, 'Подписки', 'expense', 'repeat', '#6366f1', true),
    (target_user, 'Путешествия', 'expense', 'plane', '#f59e0b', true),
    (target_user, 'Другое', 'expense', 'circle-ellipsis', '#64748b', true)
  on conflict do nothing;
end;
$$;

-- The trigger calls this function as its owner. Authenticated users must not be
-- able to seed categories into another user's account through the RPC API.
revoke all on function public.seed_default_categories(uuid) from public;
revoke all on function public.seed_default_categories(uuid) from anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, currency, theme)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'RUB',
    'light'
  )
  on conflict (id) do nothing;

  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at maintenance for profiles
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Account deletion
-- ---------------------------------------------------------------------------

-- Deletes the current auth user; all owned rows are removed via ON DELETE CASCADE.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;
grant select, insert, update, delete on public.goals to authenticated;
grant select, insert, update, delete on public.goal_contributions to authenticated;
