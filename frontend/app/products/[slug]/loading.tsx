import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="px-5 md:px-14 py-10 md:py-14 flex flex-col gap-10">
      <div className="grid md:grid-cols-2 gap-7 md:gap-10">
        <Skeleton className="h-[240px] sm:h-[300px] md:h-[340px] w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
