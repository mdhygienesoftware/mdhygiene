/** Shared shimmer block for route-level loading states. */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#EFE7E2] ${className}`} />;
}
