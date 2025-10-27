import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

export function LoadingOverlay({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}

