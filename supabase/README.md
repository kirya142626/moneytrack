# Supabase: база данных и безопасность

## 1. Применить миграции

Для нового проекта выполните три файла **строго по порядку**:

1. `migrations/0001_init.sql` — таблицы, индексы, RLS, триггер регистрации,
   стандартные категории, удаление аккаунта.
2. `migrations/0002_free_access.sql` — удаление подписок, обновление набора
   категорий, backfill «Маркетплейсы» и «Игры».
3. `migrations/0003_production_hardening.sql` — запрет ссылок на чужие категории
   в операциях и запрет прямого вызова seed-функции.

### Вариант A — SQL Editor (проще)

1. Откройте Supabase Dashboard → **SQL Editor** → **+ New query**.
2. Вставьте содержимое `0001_init.sql` целиком и нажмите **Run**.
   Дождитесь **Success. No rows returned**.
3. Повторите для `0002_free_access.sql`, затем для
   `0003_production_hardening.sql`. Каждый файл — в новом запросе.

### Вариант B — Supabase CLI

```bash
supabase link --project-ref <project-ref>
supabase db push
```

### Если проект создан по прежней версии MoneyTrack

Примените `0002_free_access.sql`, затем `0003_production_hardening.sql`.
Повторный запуск `0001` тоже безопасен: миграции идемпотентны
(`if not exists`, `drop ... if exists`, `create or replace`).

## 2. Что создаётся

| Таблица | Назначение |
| --- | --- |
| `profiles` | Имя, почта, валюта, тема (1:1 с `auth.users`) |
| `categories` | Стандартные (`is_system = true`) и собственные категории |
| `transactions` | Доходы и расходы, суммы в копейках |
| `budgets` | Месячные лимиты, общий или по категории |
| `goals` | Цели накопления |
| `goal_contributions` | Пополнения целей |

При регистрации триггер `on_auth_user_created` создаёт профиль и 19 стандартных
категорий, включая «Маркетплейсы» (`store`, `#a855f7`) и «Игры»
(`gamepad-2`, `#84cc16`). Если триггер не сработал, приложение досоздаёт данные
при первом входе (`ensureSupabaseUserData`).

Таблицы `subscriptions` и платёжных данных отсутствуют: все функции бесплатны.

## 3. Row Level Security

RLS включён для всех таблиц. Пользователь видит и изменяет только свои строки
(`user_id = auth.uid()`), профиль — только свой (`id = auth.uid()`).

Особые случаи:

- `transactions` — категория должна принадлежать тому же пользователю
  (политика из `0001`, усилена в `0003`).
- `budgets` — категория должна принадлежать тому же пользователю.
- `goal_contributions` — цель должна принадлежать тому же пользователю.
- `seed_default_categories(uuid)` — `security definer`, но прямой вызов через
  RPC от `anon`/`authenticated` запрещён. Функция работает только из триггера,
  который выполняется от владельца схемы.
- `delete_own_account()` — удаляет только текущего пользователя; выполнение
  разрешено роли `authenticated`.

Приложение никогда не использует service role key и не обходит RLS.

## 4. Настройки Auth

В **Authentication → URL Configuration**:

- **Site URL**:
  - локально: `http://localhost:3000`;
  - production: ваш домен Vercel, например
    `https://moneytrack-abc123.vercel.app` или `https://moneytrack.ru`.
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/reset-password`
  - `https://<production-домен>/auth/callback`
  - `https://<production-домен>/reset-password`

Приложение использует:

- подтверждение почты: `${NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`;
- сброс пароля: `${NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`.

`NEXT_PUBLIC_APP_URL` в Vercel и **Site URL** в Supabase должны совпадать.
Если подтверждение почты выключено, после регистрации сессия создаётся сразу.

## 5. Почта

Встроенный SMTP Supabase предназначен для тестов и имеет жёсткие лимиты.
Для реальных пользователей настройте **Authentication → SMTP Settings**:
Brevo, Resend или другой провайдер. Подробности и пошаговый вариант с Brevo —
в [DEPLOY.md](../DEPLOY.md), шаг 5.

## 6. Ключи

| Ключ | Где использовать |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Клиент и сервер |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Клиент и сервер, доступ ограничен RLS |

В новых проектах Supabase публичный ключ может называться **publishable** —
он подходит. `service_role` / `secret` ключ не требуется: приложение не выполняет
административных операций в обход RLS. Не добавляйте его в Vercel.

## 7. Удаление аккаунта

Функция `public.delete_own_account()` (security definer) удаляет `auth.users`
текущего пользователя; все связанные строки удаляются каскадно. Выполнение
разрешено только роли `authenticated`.

## 8. Проверка после настройки

1. Зарегистрируйте пользователя — в `profiles` и `categories` должны появиться
   строки.
2. Убедитесь, что стандартных категорий 19, включая «Маркетплейсы» и «Игры»:

   ```sql
   select count(*) from public.categories where user_id = 'UUID';
   select count(*) from public.categories
   where user_id = 'UUID' and name in ('Маркетплейсы', 'Игры');
   ```

3. Создайте операцию и проверьте, что второй аккаунт её не видит.
4. Проверьте, что `update`/`delete` чужой строки через anon-ключ возвращает
   0 строк.
5. Убедитесь, что таблица `subscriptions` отсутствует.
6. Убедитесь, что прямой RPC-вызов seed-функции отклоняется:

   ```sql
   select public.seed_default_categories('00000000-0000-0000-0000-000000000000');
   -- ожидается: permission denied for function seed_default_categories
   ```

7. Попробуйте вставить операцию с `category_id` чужого пользователя — RLS
   должен отклонить запрос.

## 9. Ограничения бесплатного тарифа

- Проект засыпает после недели без запросов; будится открытием консоли или
  первым запросом (может быть медленным).
- Лимиты на размер базы и трафик достаточны для личного сервиса и небольшого
  числа пользователей.
- Резервные копии на Free ограничены. Для важных данных периодически делайте
  экспорт CSV или `pg_dump`.
