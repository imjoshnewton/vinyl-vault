"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long before data is considered stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            
            // Cache time: how long to keep unused data in cache
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            
            // Refetch on window focus (disable to save database calls)
            refetchOnWindowFocus: false,
            
            // Retry failed requests (reduce to save database calls)
            retry: 1,
            
            // Background refetch interval (disable for most queries)
            refetchInterval: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}