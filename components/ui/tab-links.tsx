import Link from "next/link";
import { cn } from "@/lib/cn";

export function TabLinks({
  items,
  className,
}: {
  items: { href: string; label: string; active?: boolean; count?: number }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-surface p-1",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
            item.active
              ? "bg-surface-raised text-ink shadow-sm ring-1 ring-line"
              : "text-muted hover:text-ink",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] tabular",
                item.active ? "bg-brand-soft text-brand-strong" : "bg-surface-muted text-muted",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
