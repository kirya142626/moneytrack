import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "danger" | "warning" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-soft border-line",
  brand: "bg-brand-soft text-brand-strong border-brand/15",
  danger: "bg-danger-soft text-danger border-danger/15",
  warning: "bg-warning-soft text-warning border-warning/15",
  info: "bg-blue-50 text-blue-700 border-blue-100",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
