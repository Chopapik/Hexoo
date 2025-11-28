import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { ApiError } from "@/lib/ApiError";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

type ErrorCallback = (errorCode: string, field?: string) => void;

export default function useLogin(onErrorCallback: ErrorCallback) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  const loginMutate = useMutation({
    mutationFn: (dataWithToken: LoginData & { recaptchaToken: string }) =>
      axiosInstance.post("/auth/login", dataWithToken),

    onSuccess: (response) => {
      router.push("/");
    },
    onError: (error: ApiError) => {
      if (!error) return;

      onErrorCallback(error.code || "default");
    },
  });

  const handleLogin = async (data: LoginData) => {
    if (!executeRecaptcha) {
      onErrorCallback("reCAPTCHA nie jest jeszcze gotowa.", "root");
      return;
    }

    const token = await executeRecaptcha("login");

    const dataWithToken = {
      ...data,
      recaptchaToken: token,
    };

    loginMutate.mutate(dataWithToken);
  };

  return {
    handleLogin,
    isLoading: loginMutate.isPending,
  };
}
