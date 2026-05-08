import { useEffect, useState } from "react";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";

type UseCheckUsernameOptions = {
  currentUsername?: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function normalizeDisplayName(value: string): string {
  return value.trim().toLowerCase();
}

export function useCheckUsername(
  username: string,
  options: UseCheckUsernameOptions = {},
) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    const trimmed = debouncedUsername.trim();

    if (!trimmed) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    if (
      options.currentUsername &&
      normalizeDisplayName(trimmed) ===
        normalizeDisplayName(options.currentUsername)
    ) {
      setIsAvailable(true);
      setError(null);
      setIsChecking(false);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = (await fetchClient.post("/auth/check-username", {
          username: trimmed,
        })) as { available: boolean };

        setIsAvailable(response.available);
        setError(response.available ? null : "CONFLICT");
      } catch (error) {
        if (error instanceof ApiError && error.code === "CONFLICT") {
          setIsAvailable(false);
          setError("CONFLICT");
        } else {
          console.error("Failed to check display name:", error);
          setIsAvailable(null);
          setError(null);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkUsername();
  }, [debouncedUsername, options.currentUsername]);

  return {
    isChecking,
    isAvailable,
    error,
  };
}
