# Публичный адрес через Cloudflare Worker

Основной production-домен Vercel (`https://moneytrack-virid.vercel.app`) в некоторых сетях
не открывается: часть anycast-IP Vercel недоступна у провайдера. Чтобы сайт был доступен
всем, запросы идут через бесплатный Cloudflare Worker:

- Публичный адрес: <https://moneytrack.kyakunin896.workers.dev>
- Origin: `https://moneytrack-virid.vercel.app`
- Проверка работоспособности: <https://moneytrack.kyakunin896.workers.dev/__worker_health> → `ok`

## Как обновить

1. Открыть [Cloudflare Dashboard → Workers & Pages → moneytrack](https://dash.cloudflare.com/8c0582e73272fe3cf0b635b93994c0bc/workers/services/view/moneytrack/production).
2. Нажать **Edit code**.
3. Заменить содержимое `worker.js` на [`moneytrack-proxy.js`](./moneytrack-proxy.js).
4. Нажать **Deploy**.

## Что важно

- В Vercel должна быть переменная `NEXT_PUBLIC_APP_URL=https://moneytrack.kyakunin896.workers.dev`,
  иначе письма Supabase и метаданные будут вести на `*.vercel.app`.
- В Supabase в **Authentication → URL Configuration** нужно указать:
  - Site URL: `https://moneytrack.kyakunin896.workers.dev`
  - Redirect URLs: `https://moneytrack.kyakunin896.workers.dev/**`
- Если production-домен Vercel изменится, обновить константу `ORIGIN` в воркере.
- Воркер переписывает `Origin`/`Referer` для Server Actions, `Location` для редиректов
  и убирает `Domain` из `Set-Cookie`, чтобы сессия жила на домене `workers.dev`.
