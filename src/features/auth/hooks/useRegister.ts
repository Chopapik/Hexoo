import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RegisterData, registerFields } from "../types/auth.type";
import { ApiError } from "@/lib/AppError";
import { supabaseClient } from "@/lib/supabaseClient";
import { useI18n } from "@/i18n/useI18n";

type ErrorCallback = (errorCode: string, field: registerFields) => void;

export default function useRegister(onError: ErrorCallback) {
  const { t } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    let shouldKeepLoading = false;

    try {
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
          shouldKeepLoading = true;
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else if (msg.includes("password") || msg.includes("weak")) {
          onError("password_too_short", "password");
        } else {
          toast.error(signUpError.message ?? t("auth.register.error"));
        }

        return;
      }

      shouldKeepLoading = true;
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        onError("CONFLICT", "name");
        return;
      }

      console.error("Register error:", error);
      toast.error(t("auth.register.unknownError"));
    } finally {
      if (!shouldKeepLoading) {
        setIsLoading(false);
      }
    }
  };

  return {
    handleRegister,
    isLoading,
  };
}
