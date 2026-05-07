import { useEffect, useState } from "react";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { isUsernameBlocked } from "../constants/blockedUsernames";

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

function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/\s+/g, "");
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
    const normalizedUsername = normalizeUsername(debouncedUsername);
    const normalizedCurrentUsername = options.currentUsername
      ? normalizeUsername(options.currentUsername)
      : "";

    if (!debouncedUsername) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    if (
      normalizedCurrentUsername &&
      normalizedCurrentUsername === normalizedUsername
    ) {
      setIsAvailable(true);
      setError(null);
      setIsChecking(false);
      return;
    }

    if (debouncedUsername.trim().length < 3) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    if (isUsernameBlocked(debouncedUsername)) {
      setIsAvailable(false);
      setError("CONFLICT");
      setIsChecking(false);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = (await fetchClient.post("/auth/check-username", {
          username: debouncedUsername,
        })) as { available: boolean };

        setIsAvailable(response.available);
        if (!response.available) {
          setError("CONFLICT");
        } else {
          setError(null);
        }
      } catch (error) {
        if (error instanceof ApiError && error.code === "CONFLICT") {
          setIsAvailable(false);
          setError("CONFLICT");
        } else {
          console.error("Failed to check username:", error);
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
