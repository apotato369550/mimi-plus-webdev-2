import { cn } from "../lib/utils";

export function LoadingSpinner({ className, size = "default" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-primary-500",
          sizes[size] || sizes.default,
          className
        )}
      />
    </div>
  );
}
