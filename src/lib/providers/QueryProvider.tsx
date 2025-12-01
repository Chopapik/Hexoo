"use client";

import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { translateApiError } from "@/i18n/errorTranslator";

const handleGlobalError = (error: any) => {
  // 1. Safety check: if we're already on the error page, do nothing (avoid loops)
  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/critical-error")
  ) {
    return;
  }

  // 2. Get the status code (your JSON places it at the top level)
  const status = error?.status || 500;

  // 3. Handle critical errors (429 Rate Limit / 500 Server Error)
  if (status === 500 || status === 429) {
    // From your JSON:
    // error.data -> { ok: false, error: { ... } }
    // error.data.error -> { code: "RATE_LIMIT", data: { ... } }
    // error.data.error.data -> { ipBlocked: true, lockoutUntil: ... }  <-- this is what we need

    const code = error.code;

    // Here we extract the useful details about the lockout
    const detailsObj = error.data || { message: "Brak szczegółów" };

    // Convert the object to a string so we can pass it in the URL
    const detailsParam = encodeURIComponent(JSON.stringify(detailsObj));
    const codeParam = encodeURIComponent(code);

    window.location.replace(
      `/critical-error?status=${codeParam}&details=${detailsParam}`
    );

    return;
  }
};

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleGlobalError }),
        mutationCache: new MutationCache({ onError: handleGlobalError }),
        defaultOptions: {
          queries: {
            // Nie ponawiaj, jeśli mamy 429 lub 500
            retry: (failureCount, error: any) => {
              if (error?.status === 429 || error?.status === 500) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
