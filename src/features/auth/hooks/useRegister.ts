import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterData, registerFields } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { supabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

type ErrorCallback = (errorCode: string, field: registerFields) => void;

export default function useRegister(onError: ErrorCallback) {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const sessionMutation = useMutation({
    mutationFn: async (data: {
      idToken: string;
      name: string;
      email: string;
      recaptchaToken: string;
    }) => {
      const response = await fetchClient.post("/auth/register", data);
      router.push("/");
      return response;
    },
    onError: (error: unknown) => {
      console.error("Mutation error:", error);
      toast.error("Wystąpił błąd podczas finalizacji rejestracji.");
    },
  });

  const handleRegister = async (data: RegisterData) => {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA nie jest jeszcze gotowa.");
      return;
    }

    try {
      const checkResponse = await fetchClient.post("/auth/check-username", {
        username: data.name,
      });
      const { available } = checkResponse;

      if (!available) {
        onError("CONFLICT", "name");
        return;
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        onError("CONFLICT", "name");
        return;
      }
      console.error("Failed to check username availability:", error);
    }

    try {
      const { data: signUpData, error: signUpError } =
        await supabaseClient.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.name },
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

      const accessToken = signUpData.session?.access_token;
      if (!accessToken) {
        toast.error("Konto utworzone, ale brak sesji. Zaloguj się.");
        return;
      }

      const recaptchaToken = await executeRecaptcha("register");

      sessionMutation.mutate({
        idToken: accessToken,
        name: data.name,
        email: data.email,
        recaptchaToken,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.code === "CONFLICT") {
          onError(error.code, "name");
          return;
        }
      }
      console.error("API Error during session creation:", error);
      toast.error("Wystąpił nieznany błąd");
    }
  };

  return {
    handleRegister,
    isLoading: sessionMutation.isPending,
  };
}
