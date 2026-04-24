import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { RegisterData, registerFields } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { supabaseClient } from "@/lib/supabaseClient";

type ErrorCallback = (errorCode: string, field: registerFields) => void;

export default function useRegister(onError: ErrorCallback) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);

    try {
      const checkResponse = (await fetchClient.post("/auth/check-username", {
        username: data.name,
      })) as { available: boolean };

      if (!checkResponse.available) {
        onError("CONFLICT", "name");
        return;
      }

      const { error: signUpError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            name: data.name,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() ?? "";

        if (msg.includes("already") || msg.includes("exists")) {
          onError("auth/email-already-exists", "email");
        } else if (msg.includes("password") || msg.includes("weak")) {
          onError("password_too_short", "password");
        } else {
          toast.error(signUpError.message ?? "Błąd rejestracji.");
        }

        return;
      }

      toast.success("Konto utworzone. Sprawdź email i aktywuj konto.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        onError("CONFLICT", "name");
        return;
      }

      console.error("Register error:", error);
      toast.error("Wystąpił nieznany błąd podczas rejestracji.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleRegister,
    isLoading,
  };
}
