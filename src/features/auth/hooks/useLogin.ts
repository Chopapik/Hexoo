import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store/store";
import { LoginData } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { supabaseClient } from "@/lib/supabaseClient";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";
import type { UserRole } from "@/features/users/types/user.type";
import { useI18n } from "@/i18n/useI18n";

type ErrorCallback = (errorCode: string, field?: string) => void;

type LoginResponse = {
  user: {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    isRestricted?: boolean;
    isBanned?: boolean;
  };
};

export default function useLogin(onError: ErrorCallback) {
  const { t } = useI18n();
  const { getRecaptchaToken } = useRecaptcha();
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const sessionMutation = useMutation({
    mutationFn: async (payload: {
      idToken: string;
      refreshToken?: string;
      recaptchaToken: string;
    }) => {
      const response = await fetchClient.post("/auth/login", payload);
      return response as LoginResponse;
    },
    onSuccess: (response) => {
      setUser(response.user);
      setIsRedirecting(true);

      router.replace("/");
      router.refresh();
    },
    onError: (error: ApiError) => {
      if (!error) return;
      onError(error.code || "default");
    },
  });

  const handleLogin = async (data: LoginData) => {
    setIsSigningIn(true);

    try {
      const { data: sessionData, error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (signInError) {
        const msg = signInError.message?.toLowerCase() ?? "";

        if (msg.includes("invalid") || msg.includes("credentials")) {
          onError("INVALID_CREDENTIALS", "root");
        } else if (msg.includes("disabled") || msg.includes("banned")) {
          onError("ACCOUNT_BANNED", "root");
        } else {
          toast.error(signInError.message ?? t("auth.login.error"));
        }

        return;
      }

      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast.error(t("auth.login.noToken"));
        return;
      }

      const recaptchaToken = await getRecaptchaToken("login");
      if (!recaptchaToken) return;

      await sessionMutation.mutateAsync({
        idToken: accessToken,
        refreshToken: sessionData.session?.refresh_token,
        recaptchaToken,
      });
    } catch (error) {
      console.error(error);
      toast.error(t("common.unknown"));
    } finally {
      setIsSigningIn(false);
    }
  };

  return {
    handleLogin,
    isLoading: isSigningIn || sessionMutation.isPending || isRedirecting,
  };
}
