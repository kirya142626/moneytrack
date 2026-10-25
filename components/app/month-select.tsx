"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

export function MonthSelect({
  value,
  options,
  basePath,
}: {
  value: string;
  options: { value: string; label: string }[];
  basePath: string;
}) {
  const router = useRouter();
  return (
    <div className="relative inline-flex items-center">
      <CalendarDays size={15} className="pointer-events-none absolute left-3 text-muted" />
      <select
        value={value}
        onChange={(e) => router.push(`${basePath}?month=${e.target.value.slice(0, 7)}`)}
        className="h-10 appearance-none rounded-xl border border-line-strong bg-surface-raised pl-9 pr-8 text-[13px] font-medium text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-[var(--mt-ring)]"
        aria-label="Месяц"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-3 h-3 w-3 text-muted" aria-hidden>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
