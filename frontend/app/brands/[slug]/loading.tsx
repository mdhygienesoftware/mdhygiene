import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="px-5 md:px-14 py-10 md:py-14 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-10 w-56" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
