/**
 * MoneyTrack: reverse proxy Cloudflare Worker.
 *
 * Публичный адрес: https://moneytrack.kyakunin896.workers.dev
 * Origin:          https://moneytrack-virid.vercel.app
 * Health check:    /__worker_health
 *
 * Зачем: часть anycast-IP Vercel недоступна из некоторых сетей.
 * Worker обращается к Vercel со своих адресов и отдаёт сайт под доменом workers.dev.
 *
 * Деплой: Cloudflare Dashboard → Workers & Pages → moneytrack → Edit code → Deploy.
 */

const ORIGIN = "https://moneytrack-virid.vercel.app";
const ORIGIN_HOST = new URL(ORIGIN).host;

function rewriteSameOrigin(value, base, incomingOrigin) {
  if (!value) return value;
  let resolved;
  try {
    resolved = new URL(value, base);
  } catch {
    return value;
  }
  if (resolved.host !== ORIGIN_HOST) return value;
  const path = resolved.pathname + resolved.search + resolved.hash;
  if (value.startsWith("/")) return path;
  return incomingOrigin + path;
}

const worker = {
  async fetch(request) {
    const incoming = new URL(request.url);

    if (incoming.pathname === "/__worker_health") {
      return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    const target = new URL(ORIGIN);
    target.pathname = incoming.pathname;
    target.search = incoming.search;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    headers.delete("accept-encoding");
    headers.delete("connection");
    headers.delete("keep-alive");
    headers.delete("proxy-connection");
    headers.delete("transfer-encoding");
    headers.delete("upgrade");
    headers.delete("forwarded");
    headers.delete("x-forwarded-host");
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");
    headers.set("x-forwarded-proto", "https");

    const sameOrigin = incoming.origin;
    const requestOrigin = headers.get("origin");
    if (requestOrigin === sameOrigin) {
      headers.set("origin", ORIGIN);
    }
    const referer = headers.get("referer");
    if (referer && (referer === sameOrigin || referer.startsWith(sameOrigin + "/"))) {
      headers.set("referer", ORIGIN + referer.slice(sameOrigin.length));
    }

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const response = await fetch(target.toString(), init);
    const out = new Headers(response.headers);
    out.delete("content-length");
    out.delete("content-encoding");
    out.delete("transfer-encoding");
    out.delete("connection");
    out.delete("x-vercel-cache");
    out.delete("server");

    const location = out.get("location");
    if (location) {
      out.set("location", rewriteSameOrigin(location, ORIGIN, incoming.origin));
    }

    const actionRedirect = out.get("x-action-redirect");
    if (actionRedirect) {
      out.set(
        "x-action-redirect",
        rewriteSameOrigin(actionRedirect, ORIGIN, incoming.origin),
      );
    }

    const refresh = out.get("refresh");
    if (refresh && refresh.includes("url=")) {
      out.set(
        "refresh",
        refresh.replace(/url=([^;]+)/i, (match, url) => {
          return "url=" + rewriteSameOrigin(url.trim(), ORIGIN, incoming.origin);
        }),
      );
    }

    const cookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
    if (cookies.length > 0) {
      out.delete("set-cookie");
      for (const cookie of cookies) {
        out.append("set-cookie", cookie.replace(/;\s*Domain=[^;]+/gi, ""));
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: out,
    });
  },
};

export default worker;
