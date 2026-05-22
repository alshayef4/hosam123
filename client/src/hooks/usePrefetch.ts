import { useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook that prefetches target page data on navigation link hover.
 * Uses trpc.useUtils() to prefetch queries for the target route.
 *
 * Validates: Requirements 8.4, 10.3
 */
export function usePrefetch() {
  const utils = trpc.useUtils();

  const prefetchRoute = useCallback(
    (path: string) => {
      switch (path) {
        case "/":
          // Prefetch dashboard data (customers + ledgers for stats)
          utils.customers.list.prefetch();
          utils.ledgers.list.prefetch();
          break;
        case "/customers":
          utils.customers.list.prefetch();
          break;
        case "/ledgers":
          utils.ledgers.list.prefetch();
          break;
        case "/reports":
          utils.ledgers.list.prefetch();
          break;
        default:
          // For dynamic routes like /ledger/:id, skip prefetch
          break;
      }
    },
    [utils]
  );

  return { prefetchRoute };
}
