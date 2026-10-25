import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

export function ChartSkeleton() {
  return (
    <div className="flex h-[240px] items-end gap-2 px-1" aria-hidden>
      {[42, 68, 51, 84, 63, 92, 74, 58, 88, 66, 79, 95].map((h, i) => (
        <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
