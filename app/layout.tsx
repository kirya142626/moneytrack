import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ToastProvider } from "@/components/ui/toast";
import { appUrl } from "@/lib/server/mode";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "MoneyTrack — личные финансы под контролем",
    template: "%s · MoneyTrack",
  },
  description:
    "MoneyTrack — спокойный и понятный сервис для учёта личных финансов: доходы, расходы, бюджеты, цели и аналитика в одном месте.",
  applicationName: "MoneyTrack",
  keywords: ["учёт финансов", "личный бюджет", "бюджеты", "накопления", "финансы", "MoneyTrack"],
  authors: [{ name: "MoneyTrack" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "MoneyTrack",
    title: "MoneyTrack — личные финансы под контролем",
    description:
      "Доходы, расходы, бюджеты, цели и аналитика в одном спокойном интерфейсе. Бесплатно навсегда.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "MoneyTrack — деньги под контролем. Бюджеты, цели, аналитика и CSV.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyTrack — личные финансы под контролем",
    description: "Доходы, расходы, бюджеты, цели и аналитика в одном месте.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
