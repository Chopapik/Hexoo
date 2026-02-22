import { useCallback } from "react";

/**
 * Hook to handle critical errors (e.g. log and optionally redirect to error page).
 */
export function useCriticalError() {
  const handleCriticalError = useCallback((error: Error | unknown) => {
    if (error instanceof Error) {
      console.error("Critical error:", error);
      return;
    }
    console.error("Unknown error:", error);
  }, []);

  return { handleCriticalError };
}
