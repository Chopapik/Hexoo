"use client";

import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { translateApiError } from "@/i18n/errorTranslator";
import { AppError } from "@/lib/AppError";

const handleGlobalError = (error: Error) => {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/critical-error")
  ) {
    return;
  }

  if (!(error instanceof AppError)) return;

  const status = error.status;

  if (status === 429) {
    const code = error.code;
    const detailsObj = error.data || { message: "Brak szczegółów" };
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
            retry: (failureCount, error) => {
              if (error instanceof AppError && error.status === 429) return false;
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
    </QueryClientProvider>
  );
}
