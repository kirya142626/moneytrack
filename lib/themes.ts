import type { ThemeName } from "@/lib/types";

export const THEME_LABELS: Record<ThemeName, { title: string; description: string; swatch: string }> = {
  light: { title: "Светлая", description: "Классическая светлая тема", swatch: "#ffffff" },
  dark: { title: "Тёмная", description: "Для работы вечером", swatch: "#0a110e" },
  sand: { title: "Песочная", description: "Тёплые спокойные оттенки", swatch: "#fbf9f4" },
};
