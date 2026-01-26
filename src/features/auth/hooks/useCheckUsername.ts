import { useEffect, useState } from "react";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";

// Prosty hook do debounce
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

export function useCheckUsername(username: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedUsername = useDebounce(username, 500); // 0.5 sekundy debounce

  useEffect(() => {
    // Resetuj stan gdy username się zmienia
    if (!debouncedUsername) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    // Sprawdź minimalną długość (zgodnie z walidacją)
    if (debouncedUsername.trim().length < 3) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    // Sprawdź dostępność username
    const checkUsername = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await fetchClient.post("/auth/check-username", {
          username: debouncedUsername,
        });

        setIsAvailable(response.available);
        if (!response.available) {
          setError("CONFLICT");
        } else {
          setError(null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.code === "CONFLICT") {
          setIsAvailable(false);
          setError("CONFLICT");
        } else {
          // W przypadku innych błędów, nie blokuj użytkownika
          // Backend też sprawdzi przy rejestracji
          console.error("Failed to check username:", err);
          setIsAvailable(null);
          setError(null);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  return {
    isChecking,
    isAvailable,
    error,
  };
}
