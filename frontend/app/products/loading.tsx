import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="px-5 md:px-14 py-10 md:py-14 flex flex-col gap-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
