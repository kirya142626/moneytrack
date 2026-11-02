# Публичный адрес через Cloudflare Worker

Origin на Vercel в некоторых сетях не открывается: часть anycast-IP Vercel
недоступна у провайдера. Чтобы сайт был доступен всем, запросы идут через
бесплатный Cloudflare Worker:

- Публичный домен: <https://getmoneytrack.ru>
- Проверка работоспособности: <https://getmoneytrack.ru/__worker_health> → `ok`

Домен добавлен в Cloudflare как зона с NS `tina.ns.cloudflare.com` и
`venkat.ns.cloudflare.com`. Он привязан к воркеру через
**Workers & Pages → moneytrack → Settings → Domains & Routes → Add custom domain**.

## Как обновить

Вариант через CLI (нужен Node.js):

```bash
npx wrangler deploy --config cloudflare/wrangler.toml
```

При первом запуске `wrangler login` откроет браузер и попросит разрешение.

Вариант через панель:

1. Открыть [Cloudflare Dashboard → Workers & Pages → moneytrack](https://dash.cloudflare.com/8c0582e73272fe3cf0b635b93994c0bc/workers/services/view/moneytrack/production).
2. Нажать **Edit code**.
3. Заменить содержимое `worker.js` на [`moneytrack-proxy.js`](./moneytrack-proxy.js).
4. Нажать **Deploy**.

## Что важно

- В Vercel должна быть переменная `NEXT_PUBLIC_APP_URL=https://getmoneytrack.ru`,
  иначе письма и метаданные будут вести на служебный адрес Vercel.
- В Supabase в **Authentication → URL Configuration** нужно указать:
  - Site URL: `https://getmoneytrack.ru`
  - Redirect URLs: `https://getmoneytrack.ru/**`
- Если origin на Vercel изменится, обновить константу `ORIGIN` в воркере.
- Старый адрес `*.workers.dev` отвечает редиректом 301 на публичный домен.
- Воркер переписывает `Origin`/`Referer` для Server Actions, `Location` для редиректов
  и убирает `Domain` из `Set-Cookie`, чтобы сессия жила на публичном домене.
