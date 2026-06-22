import { useEffect, useRef, useState } from "react";
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
  const requestIdRef = useRef(0);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    let active = true;
    const trimmed = debouncedUsername.trim();

    if (!trimmed) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    if (
      options.currentUsername &&
      normalizeDisplayName(trimmed) ===
        normalizeDisplayName(options.currentUsername)
    ) {
      setIsAvailable(true);
      setError(null);
      setIsChecking(false);
      return () => {
        active = false;
        controller.abort();
      };
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = (await fetchClient.post(
          "/auth/check-username",
          { username: trimmed },
          { signal: controller.signal },
        )) as { available: boolean };

        if (!active || requestId !== requestIdRef.current) return;

        setIsAvailable(response.available);
        setError(response.available ? null : "CONFLICT");
      } catch (error) {
        if (!active || requestId !== requestIdRef.current) return;

        if (error instanceof ApiError && error.code === "CONFLICT") {
          setIsAvailable(false);
          setError("CONFLICT");
        } else {
          console.error("Failed to check display name:", error);
          setIsAvailable(null);
          setError(null);
        }
      } finally {
        if (active && requestId === requestIdRef.current) {
          setIsChecking(false);
        }
      }
    };

    checkUsername();

    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedUsername, options.currentUsername]);

  return {
    isChecking,
    isAvailable,
    error,
  };
}
