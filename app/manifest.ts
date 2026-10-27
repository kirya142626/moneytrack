import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyTrack — личные финансы",
    short_name: "MoneyTrack",
    description:
      "Учёт доходов и расходов, бюджеты, цели накопления и аналитика. Бесплатно, без подписки.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e9f6e",
    lang: "ru",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
