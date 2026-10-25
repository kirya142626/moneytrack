import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  featured = false,
  delta,
  deltaLabel = "к прошлому периоду",
  goodDirection = "up",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  featured?: boolean;
  delta?: number | null;
  deltaLabel?: string;
  goodDirection?: "up" | "down";
}) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const rising = hasDelta ? delta! > 0 : false;
  const good = hasDelta ? (goodDirection === "up" ? rising : !rising) : false;
  const flat = hasDelta ? Math.abs(delta!) < 0.0005 : true;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        featured
          ? "border-[#0b2b20] bg-[#0b2b20] text-white"
          : "border-line bg-surface-raised shadow-[0_1px_2px_rgba(13,26,20,0.03)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[12px] font-medium", featured ? "text-[#a9cdbb]" : "text-muted")}>{label}</p>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            featured ? "bg-white/10 text-[#8ff0c8]" : "bg-surface-muted text-ink-soft",
          )}
        >
          <Icon size={14} strokeWidth={1.9} />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-[24px] font-semibold leading-none tracking-[-0.035em] tabular sm:text-[26px]",
          featured ? "text-white" : "text-ink",
        )}
      >
        {value}
      </p>
      <div className="mt-2.5 flex min-h-4 items-center gap-1.5">
        {hasDelta && !flat ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-medium",
              good ? (featured ? "text-[#8ff0c8]" : "text-brand-strong") : featured ? "text-[#fda4af]" : "text-danger",
            )}
          >
            {rising ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta! * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
          </span>
        ) : null}
        <span className={cn("text-[10px]", featured ? "text-[#8fb8a4]" : "text-muted")}>
          {hint ?? (hasDelta ? (flat ? "без изменений" : deltaLabel) : "")}
        </span>
      </div>
    </div>
  );
}
