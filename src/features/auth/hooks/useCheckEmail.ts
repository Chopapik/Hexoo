import { useEffect, useState } from "react";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";

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

export function useCheckEmail(email: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    if (!debouncedEmail) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(debouncedEmail.trim())) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    // Sprawdź dostępność email
    const checkEmail = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await fetchClient.post("/auth/check-email", {
          email: debouncedEmail,
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
          console.error("Failed to check email availability:", err);
          setIsAvailable(null);
          setError(null);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  return {
    isChecking,
    isAvailable,
    error,
  };
}
