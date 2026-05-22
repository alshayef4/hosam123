import { Skeleton } from "@/components/ui/skeleton";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface LoadingStateProps {
  message?: string;
  rows?: number;
  variant?: "default" | "dashboard" | "table";
}

/**
 * Skeleton loading component with RTL-aware shimmer animation (1.5s loop),
 * configurable message and row count. Skeleton shapes match actual content
 * dimensions to minimize CLS (≤ 16px vertical displacement).
 *
 * Includes role="status" and aria-label for accessibility.
 * Content fade-in: opacity 0 + 8px y-translate → visible, 300ms ease-out.
 * Skips animation when prefers-reduced-motion is enabled.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */
export function LoadingState({
  message = "جاري التحميل...",
  rows = 5,
  variant = "default",
}: LoadingStateProps) {
  if (variant === "dashboard") {
    return <DashboardSkeleton message={message} />;
  }

  if (variant === "table") {
    return <TableSkeleton message={message} rows={rows} />;
  }

  return (
    <div
      className="w-full space-y-4"
      role="status"
      aria-label={message}
    >
      {/* Skeleton rows matching content dimensions */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-full animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-4 w-3/4 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-4 w-1/2 animate-shimmer motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard skeleton: 4 KPI cards + 2 chart cards */
function DashboardSkeleton({ message }: { message: string }) {
  return (
    <div className="w-full space-y-8" role="status" aria-label={message}>
      {/* KPI Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-6 space-y-3">
            <Skeleton className="h-4 w-24 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-8 w-16 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-3 w-20 animate-shimmer motion-reduce:animate-none" />
          </div>
        ))}
      </div>

      {/* Chart cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-lg border border-border/50 p-6 space-y-4">
          <Skeleton className="h-5 w-32 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-3 w-48 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-[200px] w-full rounded-lg animate-shimmer motion-reduce:animate-none" />
        </div>
        <div className="rounded-lg border border-border/50 p-6 space-y-4">
          <Skeleton className="h-5 w-32 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-3 w-48 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-[200px] w-full rounded-lg animate-shimmer motion-reduce:animate-none" />
        </div>
        <div className="rounded-lg border border-border/50 p-6 space-y-4">
          <Skeleton className="h-5 w-32 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-3 w-48 animate-shimmer motion-reduce:animate-none" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg animate-shimmer motion-reduce:animate-none" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Table skeleton: header + rows matching table layout */
function TableSkeleton({ message, rows }: { message: string; rows: number }) {
  return (
    <div className="w-full space-y-4" role="status" aria-label={message}>
      {/* Search bar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48 animate-shimmer motion-reduce:animate-none" />
        <Skeleton className="h-9 w-64 rounded-md animate-shimmer motion-reduce:animate-none" />
      </div>

      {/* Table header */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 p-3 bg-muted/30 border-b">
          <Skeleton className="h-4 w-24 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-4 w-20 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-4 w-16 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-4 w-28 animate-shimmer motion-reduce:animate-none" />
          <Skeleton className="h-4 w-20 animate-shimmer motion-reduce:animate-none" />
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-3 ${i % 2 === 0 ? "bg-muted/10" : ""}`}
          >
            <Skeleton className="h-4 w-32 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-4 w-24 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-6 w-14 rounded-full animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-4 w-28 animate-shimmer motion-reduce:animate-none" />
            <Skeleton className="h-8 w-16 rounded-md animate-shimmer motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Wrapper component that provides content fade-in animation
 * when content finishes loading. Skips animation when
 * prefers-reduced-motion is enabled.
 *
 * Validates: Requirements 9.3
 */
export function ContentFadeIn({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <div className="animate-[content-fade-in_300ms_ease-out_both]">
      {children}
    </div>
  );
}
