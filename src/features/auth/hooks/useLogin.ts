import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { ApiError } from "@/lib/ApiError";

type ErrorCallback = (errorCode: string, field?: string) => void;

export default function useLogin(onErrorCallback: ErrorCallback) {
  const router = useRouter();

  const loginMutate = useMutation({
    mutationFn: (userData: LoginData) =>
      axiosInstance.post(`/auth/login`, userData),

    onSuccess: (response) => {
      router.push("/");
    },

    onError: (error: ApiError) => {
      if (!error) return;

      if (error.code === "VALIDATION_ERROR" && error.data?.details) {
        Object.entries(error.data.details).forEach(([field, messages]) => {
          const msgArray = messages as string[];
          if (msgArray.length > 0) {
            onErrorCallback(msgArray[0], field);
          }
        });
        return;
      }
      onErrorCallback(error.code || "default");
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutate.mutate(data);
  };

  return {
    handleLogin,
    isLoading: loginMutate.isPending,
  };
}
