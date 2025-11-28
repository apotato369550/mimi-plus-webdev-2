import { cn } from "../lib/utils";

export function SkeletonCard({ className }) {
  return (
    <div className={cn("flex flex-col bg-white px-6 py-5 border border-gray-300 rounded-lg h-[280px] w-[449px] animate-pulse", className)}>
      <div className="flex gap-4 pb-4">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="flex justify-between items-center py-4">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
  );
}

export function SkeletonMetricCard({ className }) {
  return (
    <div className={cn("flex bg-white flex-col px-4 py-3 border border-gray-300 rounded-lg shadow-xs h-fit w-full gap-2 animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  );
}
