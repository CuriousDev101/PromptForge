"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401/403/404
              const status = (error as { status?: number })?.status;
              if (status && [401, 403, 404].includes(status)) return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          theme="system"
          closeButton
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
