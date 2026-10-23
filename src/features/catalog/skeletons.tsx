import { Skeleton } from "@/shared/components/ui/skeleton";

export function NftGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-surface-card"
        >
          <Skeleton className="aspect-square w-full motion-reduce:animate-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4 motion-reduce:animate-none" />
            <Skeleton className="h-3 w-1/2 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
