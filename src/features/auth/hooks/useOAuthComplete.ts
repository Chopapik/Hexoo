"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store/store";
import { OAuthCompleteData, OAuthCompleteFields } from "../types/auth.type";
import type { UserRole } from "@/features/users/types/user.type";

type ErrorCallback = (errorCode: string, field?: OAuthCompleteFields) => void;

type CompleteOAuthResponse = {
  user: {
    uid: string;
    email?: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
  };
};

/**
 * Submits the chosen username to `/api/auth/oauth-complete-profile`
 * using the current Supabase access + refresh tokens. On success the
 * backend creates the app session and this hook finalises client state.
 */
export default function useOAuthComplete(onError: ErrorCallback) {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const mutation = useMutation({
    mutationFn: async (payload: {
      idToken: string;
      refreshToken?: string;
      name: string;
    }) => {
      const response = await fetchClient.post(
        "/auth/oauth-complete-profile",
        payload,
      );
      return response as CompleteOAuthResponse;
    },
    onSuccess: (response) => {
      setUser({
        ...response.user,
        email: response.user.email ?? "",
      });
      router.replace("/");
      router.refresh();
    },
    onError: (error: ApiError) => {
      if (!error) return;

      const field =
        (error.data && typeof error.data === "object" && "field" in error.data
          ? (error.data.field as OAuthCompleteFields | undefined)
          : undefined) ?? undefined;

      if (error.code === "CONFLICT") {
        onError("CONFLICT", field ?? "name");
        return;
      }

      if (error.code === "VALIDATION_ERROR") {
        onError("VALIDATION_ERROR", field ?? "name");
        return;
      }

      if (error.code === "USER_NOT_FOUND") {
        toast.error("Sesja OAuth wygasła, zaloguj się ponownie przez Google.");
        router.replace("/login");
        return;
      }

      onError(error.code ?? "default");
    },
  });

  const handleComplete = async (data: OAuthCompleteData) => {
    try {
      const { data: sessionResult, error: sessionErr } =
        await supabaseClient.auth.getSession();

      if (sessionErr || !sessionResult.session) {
        toast.error(
          "Sesja Google wygasła. Zaloguj się ponownie przez Google.",
        );
        router.replace("/login");
        return;
      }

      const { access_token: idToken, refresh_token: refreshToken } =
        sessionResult.session;

      mutation.mutate({
        idToken,
        refreshToken,
        name: data.name,
      });
    } catch (error) {
      console.error("[useOAuthComplete]", error);
      toast.error("Wystąpił nieznany błąd.");
    }
  };

  return {
    handleComplete,
    isLoading: mutation.isPending,
  };
}
