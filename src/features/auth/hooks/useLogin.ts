import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginData } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { supabaseClient } from "@/lib/supabaseClient";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";

type ErrorCallback = (errorCode: string, field?: string, data?: any) => void;

export default function useLogin(onError: ErrorCallback) {
  const { getRecaptchaToken } = useRecaptcha();
  const router = useRouter();

  const sessionMutation = useMutation({
    mutationFn: async (payload: {
      idToken: string;
      recaptchaToken: string;
    }) => {
      const response = await fetchClient.post("/auth/login", payload);
      router.push("/");
      return response;
    },
    onError: (error: ApiError) => {
      if (!error) return;
      onError(error.code || "default");
    },
  });

  const handleLogin = async (data: LoginData) => {
    try {
      const { data: sessionData, error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (signInError) {
        const msg = signInError.message?.toLowerCase() ?? "";
        if (
          msg.includes("invalid") ||
          msg.includes("credentials") ||
          msg.includes("invalid_login_credentials")
        ) {
          onError("INVALID_CREDENTIALS", "root");
        } else if (msg.includes("too many") || msg.includes("rate")) {
          onError("RATE_LIMIT", "root");
        } else if (msg.includes("disabled") || msg.includes("banned")) {
          onError("ACCOUNT_BANNED", "root");
        } else {
          toast.error(signInError.message ?? "Błąd logowania.");
        }
        return;
      }

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast.error("Brak tokena sesji.");
        return;
      }

      const recaptchaToken = await getRecaptchaToken("login");
      if (recaptchaToken) {
        sessionMutation.mutate({ idToken: accessToken, recaptchaToken });
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Wystąpił nieznany błąd.");
    }
  };

  return {
    handleLogin,
    isLoading: sessionMutation.isPending,
  };
}
