-- MoneyTrack · переход на полностью бесплатный доступ
-- Применяйте после 0001_init.sql, если схема уже создана.
-- Удаляет таблицу подписок, обновляет триггер регистрации и добавляет
-- категории «Маркетплейсы» и «Игры» существующим пользователям.

-- ---------------------------------------------------------------------------
-- 1. Удаляем платные подписки
-- ---------------------------------------------------------------------------

drop table if exists public.subscriptions cascade;

-- ---------------------------------------------------------------------------
-- 2. Обновляем стартовый набор категорий (19 штук)
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
    (target_user, 'Другое', 'expense', 'circle-ellipsis', '#64748b', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Убираем подписку из триггера регистрации
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 4. Добавляем новые категории существующим пользователям
-- ---------------------------------------------------------------------------

insert into public.categories (user_id, name, type, icon, color, is_system)
select u.id, v.name, 'expense', v.icon, v.color, true
from auth.users u
cross join (
  values
    ('Маркетплейсы', 'store', '#a855f7'),
    ('Игры', 'gamepad-2', '#84cc16')
) as v(name, icon, color)
where not exists (
  select 1
  from public.categories c
  where c.user_id = u.id
    and c.type = 'expense'
    and c.name = v.name
);
