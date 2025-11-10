import { FirebaseError } from "firebase/app";
import { useCallback } from "react";

/**
 * Hook to handle critical (non-Firebase) errors.
 * Currently only logs the error; in the future can redirect to an error page.
 */
export function useCriticalError() {
  /**
   * Handle a critical error.
   * @param error - The caught exception.
   */
  const handleCriticalError = useCallback(
    (error: Error | FirebaseError | unknown) => {
      if (error instanceof FirebaseError) {
        console.log("Critical Firebase error:", error);
        return;
      }

      if (error instanceof Error) {
        console.log("Critical error:", error);
        return;
      }

      console.log("Unknown error appeared:", error);

      // TODO: in the future, redirect user to a generic error page
    },
    []
  );

  return { handleCriticalError };
}
