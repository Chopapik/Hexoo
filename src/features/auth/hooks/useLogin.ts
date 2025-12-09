import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { ApiError } from "@/lib/ApiError";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";

type ErrorCallback = (errorCode: string, field?: string) => void;

export default function useLogin(onError: ErrorCallback) {
  const { getRecaptchaToken } = useRecaptcha();
  const router = useRouter();

  const sessionMutation = useMutation({
    mutationFn: (payload: { idToken: string; recaptchaToken: string }) =>
      axiosInstance.post("/auth/login", payload),

    onSuccess: () => {
      router.push("/");
    },
    onError: (error: ApiError) => {
      if (!error) return;
      onError(error.code || "default");
    },
  });

  const handleLogin = async (data: LoginData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const recaptchaToken = await getRecaptchaToken("login");

      const idToken = await userCredential.user.getIdToken();

      recaptchaToken && sessionMutation.mutate({ idToken, recaptchaToken });
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;

        if (
          errorCode === "auth/invalid-credential" ||
          errorCode === "auth/user-not-found" ||
          errorCode === "auth/wrong-password"
        ) {
          onError("INVALID_CREDENTIALS", "root");
        } else if (errorCode === "auth/too-many-requests") {
          onError("RATE_LIMIT", "root");
        } else if (errorCode === "auth/user-disabled") {
          onError("FORBIDDEN", "root");
        } else {
          onError("default", "root");
        }
      }
    }
  };

  return {
    handleLogin,
    isLoading: sessionMutation.isPending,
  };
}
