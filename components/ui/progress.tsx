import { cn } from "@/lib/cn";

export function Progress({
  value,
  tone = "brand",
  className,
  height = "h-2",
}: {
  value: number;
  tone?: "brand" | "danger" | "warning" | "ink";
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(value * 100, 100));
  const colors = {
    brand: "bg-brand",
    danger: "bg-danger",
    warning: "bg-warning",
    ink: "bg-ink",
  } as const;
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-surface-muted", height, className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", colors[tone])}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
