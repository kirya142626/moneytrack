#!/usr/bin/env node
/**
 * Smoke-тест production-сайта.
 *
 *   npm run smoke
 *   SMOKE_BASE_URL=https://moneytrack-virid.vercel.app npm run smoke
 *
 * Проверяет статусы, типы контента и ключевые данные страниц.
 * Завершается с кодом 1, если хотя бы одна проверка не прошла.
 */

const base = (
  process.env.SMOKE_BASE_URL ?? "https://moneytrack.kyakunin896.workers.dev"
).replace(/\/+$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 15000);

const checks = [
  { path: "/", type: "text/html", includes: "MoneyTrack" },
  { path: "/login", type: "text/html", includes: "Войдите в MoneyTrack" },
  { path: "/features", type: "text/html", includes: "Все возможности" },
  {
    path: "/api/health",
    type: "application/json",
    json: (data) => data.status === "ok",
  },
  { path: "/favicon.ico", type: "image/x-icon" },
  { path: "/icon.svg", type: "image/svg+xml" },
  { path: "/apple-icon.png", type: "image/png" },
  {
    path: "/manifest.webmanifest",
    type: "application/manifest+json",
    json: (data) => data.start_url === "/" && Array.isArray(data.icons) && data.icons.length > 0,
  },
  { path: "/robots.txt", type: "text/plain", includes: "Sitemap:" },
  { path: "/sitemap.xml", type: "application/xml", includes: base },
];

if (new URL(base).hostname.endsWith(".workers.dev")) {
  checks.push({ path: "/__worker_health", type: "text/plain", includes: "ok" });
}

function isExpectedType(actual, expected) {
  return (actual ?? "").toLowerCase().startsWith(expected.toLowerCase());
}

async function runCheck(check) {
  const startedAt = Date.now();
  const url = `${base}${check.path}`;

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.text();
    const elapsed = Date.now() - startedAt;

    if (response.status !== 200) {
      return { ok: false, elapsed, message: `HTTP ${response.status}` };
    }

    if (check.type && !isExpectedType(response.headers.get("content-type"), check.type)) {
      return {
        ok: false,
        elapsed,
        message: `content-type ${response.headers.get("content-type") ?? "—"}`,
      };
    }

    if (check.includes && !body.includes(check.includes)) {
      return { ok: false, elapsed, message: `нет фрагмента «${check.includes}»` };
    }

    if (check.json) {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return { ok: false, elapsed, message: "ответ не JSON" };
      }
      if (!check.json(data)) {
        return { ok: false, elapsed, message: `неожиданный JSON: ${body.slice(0, 160)}` };
      }
    }

    return { ok: true, elapsed };
  } catch (error) {
    return {
      ok: false,
      elapsed: Date.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

let failed = 0;

console.log(`MoneyTrack smoke: ${base}\n`);

for (const check of checks) {
  const result = await runCheck(check);
  if (!result.ok) failed += 1;
  const mark = result.ok ? "OK  " : "FAIL";
  const details = result.ok ? "" : ` — ${result.message}`;
  console.log(`  ${mark} ${check.path} — ${result.elapsed} ms${details}`);
}

console.log("");

if (failed > 0) {
  console.error(`Провалено ${failed} из ${checks.length} проверок.`);
  process.exit(1);
}

console.log(`Все ${checks.length} проверок пройдены.`);
