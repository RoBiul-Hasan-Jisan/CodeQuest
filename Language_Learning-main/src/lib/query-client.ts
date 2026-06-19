import { QueryClient } from "@tanstack/react-query";

import { QUERY_CACHE_TIME, QUERY_STALE_TIME } from "./constants";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_CACHE_TIME,
        retry: (failureCount, error) => {
          // Do not retry on 4xx errors
          if (error instanceof Error && "status" in error) {
            const status = (error as Error & { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
      },
      mutations: {
        retry: false,
      },
    },
  });
}
