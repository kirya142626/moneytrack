import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="animate-fade-in">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-8 w-64" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-2xl lg:col-span-2" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[280px] rounded-2xl lg:col-span-2" />
        <Skeleton className="h-[280px] rounded-2xl" />
      </div>
    </div>
  );
}
