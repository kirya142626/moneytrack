import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/server/mode";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/features", "/privacy", "/terms"],
        disallow: [
          "/dashboard",
          "/transactions",
          "/analytics",
          "/budgets",
          "/goals",
          "/categories",
          "/settings",
          "/api/",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
