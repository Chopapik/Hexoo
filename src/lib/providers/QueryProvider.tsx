"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ApiError } from "../ApiError";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { translateApiError } from "@/i18n/errorTranslator";

const handleGlobalError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 500) {
      const code = encodeURIComponent(error.code);
      const message = encodeURIComponent(error.message.toString());

      window.location.replace(
        `/critical-error?status=${code}&message=${message}`
      );
      return;
    }
    toast.error(translateApiError(error));
    return;
  }
};

const queryCache = new QueryCache({
  onError: handleGlobalError,
});

const mutationCache = new MutationCache({
  onError: handleGlobalError,
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
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
