"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { PERIOD_PRESETS, type PeriodPreset } from "@/lib/finance";

export function PeriodSelect({
  value,
  basePath = "/dashboard",
  extraParams,
}: {
  value: PeriodPreset;
  basePath?: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  function onChange(next: string) {
    const params = new URLSearchParams(extraParams);
    params.set("period", next);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="relative inline-flex items-center">
      <CalendarDays size={15} className="pointer-events-none absolute left-3 text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-line-strong bg-surface-raised pl-9 pr-8 text-[13px] font-medium text-ink shadow-sm transition-colors hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
        aria-label="Период"
      >
        {PERIOD_PRESETS.map((preset) => (
          <option key={preset.key} value={preset.key}>
            {preset.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-3 h-3 w-3 text-muted" aria-hidden>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
