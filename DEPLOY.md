# Публикация MoneyTrack: Vercel + Supabase

Пошаговая инструкция для первого деплоя. Аккаунты создаются с нуля, банковская карта
не нужна: Vercel Hobby и Supabase Free работают бесплатно.

**Схема**

```text
GitHub (код) ──► Vercel (Next.js, HTTPS)
                      │
                      ├── Supabase Auth   (регистрация, вход, сброс пароля)
                      └── Supabase Postgres (данные, RLS)
```

**Время:** 30–45 минут, из них большая часть — ожидание сборки и создание аккаунтов.

**Что понадобится**

- почта для регистрации;
- аккаунт GitHub;
- Git для Windows (устанавливается на шаге 2);
- Node.js на компьютере не обязателен для деплоя — Vercel собирает проект сам.
  Node нужен только для локальной проверки.

---

## Шаг 1. Создать проект Supabase

1. Откройте <https://supabase.com> и нажмите **Start your project**.
   Зарегистрируйтесь через GitHub или почту.
2. В консоли нажмите **New project**.
3. Заполните:
   - **Name:** `moneytrack`;
   - **Database Password:** нажмите **Generate a password** и сохраните его
     в надёжном месте (для работы приложения он не нужен, но пригодится для
     прямого доступа к базе);
   - **Region:** ближайший к вам, например **Frankfurt (eu-central-1)**;
   - **Plan:** Free.
4. Нажмите **Create new project** и подождите 1–2 минуты, пока проект
   подготовится.

> Бесплатный проект Supabase засыпает после недели без запросов. Перед показом
> сайта людям просто откройте его в консоли — он проснётся.

### 1.1. Применить миграции

Миграции создают таблицы, RLS-политики, триггер регистрации и 19 стартовых
категорий.

1. В левом меню откройте **SQL Editor**.
2. Нажмите **+ New query**.
3. Откройте в проекте файл `supabase/migrations/0001_init.sql`, скопируйте **всё**
   содержимое и вставьте в редактор.
4. Нажмите **Run** (или `Ctrl+Enter`). Должно появиться
   **Success. No rows returned**.
5. Повторите то же самое по порядку:
   - `supabase/migrations/0002_free_access.sql`;
   - `supabase/migrations/0003_production_hardening.sql`.

Порядок важен: `0002` обновляет стартовые категории, `0003` закрывает две
потенциальные дыры в доступе.

**Проверка:** в левом меню откройте **Table Editor**. Должны быть таблицы
`profiles`, `categories`, `transactions`, `budgets`, `goals`,
`goal_contributions`. Таблицы `subscriptions` быть не должно.

### 1.2. Скопировать ключи

1. Откройте **Project Settings** (шестерёнка внизу слева) → **API**
   (в новых проектах — **API Keys**).
2. Скопируйте и сохраните:
   - **Project URL** — выглядит как `https://abcdefgh.supabase.co`;
   - **anon public** (или **publishable**) ключ — длинная строка.

Это публичные ключи: они попадают в браузер, а доступ к чужим данным запрещает
RLS. **Не копируйте `service_role` / `secret` ключ** — приложению он не нужен,
и его нельзя добавлять в Vercel.

### 1.3. Настройки Auth — позже

URL сайта и ссылки пересылки зависят от домена Vercel. Вернитесь к этому шагу 4
после первого деплоя.

---

## Шаг 2. Загрузить код на GitHub

### 2.1. Установить Git

1. Скачайте **Git for Windows**: <https://git-scm.com/download/win>.
2. Запустите установщик и везде оставьте настройки по умолчанию
   (подойдёт вариант **Git from the command line and also from 3rd-party software**).
3. Закройте и снова откройте PowerShell.
4. Проверьте:

   ```powershell
   git --version
   ```

Должна появиться версия вида `git version 2.x.x`.

### 2.2. Представиться Git

Выполните один раз (подставьте свои данные):

```powershell
git config --global user.name "Ваше Имя"
git config --global user.email "ваша-почта@example.com"
```

Почта может совпадать с почтой GitHub — тогда коммиты будут связаны с профилем.

### 2.3. Создать репозиторий

1. Откройте <https://github.com/new>.
2. **Repository name:** `moneytrack`.
3. Выберите **Private** (рекомендуется).
4. **Не** включайте README, `.gitignore` и лицензию — они уже есть в проекте.
5. Нажмите **Create repository**.

### 2.4. Сделать первый коммит и отправить код

Откройте PowerShell в папке проекта (в Проводнике: правой кнопкой по папке →
**Открыть в терминале**) и выполните по одной команде:

```powershell
git init
git add .
git commit -m "MoneyTrack: production-ready"
git branch -M main
git remote add origin https://github.com/ВАШ-ЛОГИН/moneytrack.git
git push -u origin main
```

При первом `push` Git может открыть окно входа в GitHub — войдите и разрешите
доступ. Если репозиторий уже существует и `remote add` ругается, выполните
`git remote set-url origin https://github.com/ВАШ-ЛОГИН/moneytrack.git`.

**Проверка:** обновите страницу репозитория — файлы должны появиться.

> `.env.local` и папка `data/` исключены через `.gitignore`, поэтому ключи и
> локальная база на GitHub не попадут.

---

## Шаг 3. Задеплоить на Vercel

1. Откройте <https://vercel.com> и нажмите **Sign Up** → **Continue with GitHub**.
   Разрешите доступ к репозиториям (можно выбрать только `moneytrack`).
2. Нажмите **Add New…** → **Project**.
3. Найдите `moneytrack` и нажмите **Import**.
4. Настройки оставьте по умолчанию:
   - **Framework Preset:** Next.js;
   - **Root Directory:** `./`;
   - **Build Command:** `npm run build`;
   - **Output Directory:** `.next`.
5. Откройте **Environment Variables** и добавьте две переменные:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL из Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable ключ из Supabase |

   Для каждой выберите окружения **Production**, **Preview** и **Development**
   (или оставьте все отмеченными).

   **Не добавляйте** `MONEYTRACK_DB_PATH` — на Vercel локальная SQLite не
   используется.

6. Нажмите **Deploy** и дождитесь статуса **Ready** (1–3 минуты).
7. Скопируйте домен из блока **Domains**, например
   `https://moneytrack-abc123.vercel.app`.

### 3.1. Добавить адрес приложения

Адрес нужен, чтобы письма подтверждения и сброса пароля вели на ваш сайт, а не
на служебный адрес деплоя.

1. В Vercel откройте проект → **Settings** → **Environment Variables**.
2. Добавьте:
   - **Name:** `NEXT_PUBLIC_APP_URL`;
   - **Value:** `https://moneytrack-abc123.vercel.app` (ваш домен, **без** `/` в конце);
   - **Environments:** Production.
3. Сохраните.
4. Откройте **Deployments** → у последнего деплоя меню **⋯** → **Redeploy**.
   Подтвердите. Это обязательно: `NEXT_PUBLIC_*` встраиваются в сборку, и без
   пересборки новый адрес не применится.

> Если открыть сайт до добавления ключей Supabase, вместо приложения появится
> страница **503 «MoneyTrack не настроен»**. Это защита от случайного запуска на
> локальной SQLite на Vercel. Добавьте переменные и сделайте Redeploy.

---

## Шаг 4. Настроить Supabase Auth

Вернитесь в Supabase → **Authentication** → **URL Configuration**.

1. **Site URL** — основной адрес сайта:

   ```text
   https://moneytrack-abc123.vercel.app
   ```

2. **Redirect URLs** — добавьте по одной кнопкой **Add URL**:

   ```text
   https://moneytrack-abc123.vercel.app/auth/callback
   https://moneytrack-abc123.vercel.app/reset-password
   http://localhost:3000/auth/callback
   http://localhost:3000/reset-password
   ```

   Последние две — для локальной разработки. Если локальный режим не нужен,
   их можно не добавлять.

3. Нажмите **Save**.

Приложение формирует ссылки так:

- подтверждение почты → `NEXT_PUBLIC_APP_URL/auth/callback?next=/dashboard`;
- сброс пароля → `NEXT_PUBLIC_APP_URL/auth/callback?next=/reset-password`.

Если домен в Vercel и `NEXT_PUBLIC_APP_URL` не совпадают, ссылки из писем будут
вести не туда или Supabase отклонит пересылку.

---

## Шаг 5. Настроить почту

По умолчанию Supabase отправляет письма через собственный тестовый SMTP:
количество писем в час сильно ограничено, и для реальных пользователей это
ненадёжно.

### Вариант A — быстрый запуск без подтверждения почты

1. Supabase → **Authentication** → **Sign In / Providers** → **Email**.
2. Выключите **Confirm email** и сохраните.

После регистрации сессия создаётся сразу. Минус: почта не проверяется, а письма
для сброса пароля всё равно идут через лимитированный SMTP.

### Вариант B — полноценная почта (рекомендуется перед публикацией)

Подойдёт бесплатный тариф Brevo: до 300 писем в день.

1. Зарегистрируйтесь на <https://www.brevo.com>.
2. В разделе **Senders & IP** добавьте и подтвердите адрес отправителя
   (например, свою почту).
3. Откройте **SMTP & API** → вкладка **SMTP**:
   - сервер: `smtp-relay.brevo.com`;
   - порт: `587`;
   - логин и пароль SMTP — скопируйте из панели Brevo.
4. В Supabase → **Authentication** → **SMTP Settings** (или **Emails**):
   - включите **Enable Custom SMTP**;
   - **Sender email** — подтверждённый адрес из Brevo;
   - **Sender name** — `MoneyTrack`;
   - **Host**, **Port**, **Username**, **Password** — из Brevo.
5. Сохраните и оставьте **Confirm email** включённым.
6. Проверьте регистрацию и сброс пароля на настоящей почте.

> Альтернатива — Resend, но для отправки на любые адреса там требуется
> подтвердить собственный домен. Brevo проще для старта.

---

## Шаг 6. Проверить production

Откройте сайт в режиме инкогнито и пройдите чек-лист:

- [ ] Лендинг открывается, картинка для соцсетей и иконки загружаются.
- [ ] `/features`, `/privacy`, `/terms` открываются.
- [ ] Регистрация создаёт аккаунт; письмо приходит (если подтверждение включено).
- [ ] Вход и выход работают.
- [ ] В Supabase → **Table Editor** → `categories` у нового пользователя ровно
      19 категорий, включая «Маркетплейсы» и «Игры».
- [ ] Создаются доход, расход, бюджет и цель; аналитика показывает данные.
- [ ] Работают фильтры, темы, мобильное меню.
- [ ] CSV-экспорт скачивает только ваши операции.
- [ ] Сброс пароля: письмо приходит, ссылка открывает форму, новый пароль
      подходит.
- [ ] Второй аккаунт не видит операции первого.
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` отвечают `200`.
- [ ] В настройках удаление аккаунта удаляет пользователя и его данные.

Полезные SQL-проверки в Supabase SQL Editor (подставьте id пользователя из
`Authentication → Users`):

```sql
-- Должно быть 19
select count(*) from public.categories where user_id = 'UUID';

-- Должно быть 2
select count(*) from public.categories
where user_id = 'UUID' and name in ('Маркетплейсы', 'Игры');

-- Должно быть пусто: политики не дают читать чужие строки
select * from public.transactions where user_id <> auth.uid();
```

---

## Шаг 7. Свой домен (необязательно)

1. Купите домен у любого регистратора (например, reg.ru, Namecheap, Cloudflare).
2. Vercel → проект → **Settings** → **Domains** → **Add**.
3. Введите домен, например `moneytrack.ru`, и следуйте DNS-инструкции Vercel.
4. После появления статуса **Valid Configuration** обновите:
   - Vercel → `NEXT_PUBLIC_APP_URL` = `https://moneytrack.ru`;
   - Supabase → **Site URL** = `https://moneytrack.ru`;
   - Supabase → **Redirect URLs** добавьте
     `https://moneytrack.ru/auth/callback` и
     `https://moneytrack.ru/reset-password`.
5. Сделайте **Redeploy** в Vercel.

Старый адрес `*.vercel.app` можно оставить рабочим — Vercel перенаправит его на
основной домен.

---

## Если что-то не работает

| Симптом | Причина и решение |
| --- | --- |
| Страница **503 «MoneyTrack не настроен»** | На Vercel нет `NEXT_PUBLIC_SUPABASE_URL` или `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Добавьте обе для **Production** и сделайте **Redeploy**. |
| Сборка падает с ошибкой Node.js | Vercel → **Settings** → **General** → **Node.js Version** выберите **24.x**, затем Redeploy. Версия также закреплена в `package.json`. |
| `relation "public.profiles" does not exist` | Не применены миграции. Выполните `0001 → 0002 → 0003` в SQL Editor. |
| `new row violates row-level security policy` | Не применена `0001_init.sql` или `0003_production_hardening.sql`; либо операция ссылается на чужую категорию/цель. |
| **Invalid login credentials** после регистрации | Включено подтверждение почты, но адрес ещё не подтверждён. Подтвердите письмо или выключите **Confirm email**. |
| Письмо не приходит | Проверьте папку «Спам», лимиты встроенного SMTP, правильность **Site URL** и **Redirect URLs**. Настройте Brevo. |
| Ссылка из письма ведёт на `localhost` | В Vercel устарел `NEXT_PUBLIC_APP_URL`. Исправьте значение и сделайте **Redeploy** — без пересборки не применится. |
| Ссылка открывается, но пишет `otp_expired` | Ссылка уже использована или истекла. Запросите новую. Также проверьте, что домен добавлен в **Redirect URLs**. |
| После входа снова редиректит на `/login` | Проверьте, что домен сайта совпадает с `NEXT_PUBLIC_APP_URL`; очистите cookie и войдите заново. |
| Supabase отвечает ошибкой `Project paused` | Free-проект уснул. Откройте консоль Supabase и нажмите **Restore**. |
| Деплой успешен, но данные не сохраняются | На Vercel всегда используется Supabase. Проверьте, что переменные добавлены именно в **Production**, и повторите Redeploy. |

---

## Безопасность: коротко

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` можно показывать браузеру: доступ ограничен
  RLS-политиками. `service_role`/`secret` ключ не используйте и никуда не
  вставляйте.
- `.env.local` не коммитится. Если ключ всё же попал в репозиторий — удалите
  файл из истории и перевыпустите ключи в Supabase.
- Все таблицы закрыты RLS. Операции могут ссылаться только на категории своего
  пользователя; пополнения — только на свои цели.
- Пароль базы данных Supabase не нужен приложению. Храните его отдельно.
- HTTPS, HSTS и базовые security-заголовки включаются на Vercel автоматически
  конфигурацией проекта.

---

## Что осталось непроверенным

В этой среде не было аккаунта Supabase и Docker, поэтому живой путь Supabase
(RLS, триггер регистрации, письма, OAuth-пересылки) проверен только по коду и
SQL. Локальный режим на SQLite протестирован полностью. После шага 6 обязательно
пройдите чек-лист на реальном проекте — это и есть приёмка production.
