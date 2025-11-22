import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { ApiError } from "@/lib/ApiError";

type ErrorCallback = (errorCode: string, field?: string) => void;

export default function useRegister(onErrorCallback: ErrorCallback) {
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) =>
      axiosInstance.post(`/auth/register`, userData),

    onSuccess: () => {
      router.push("/");
    },

    onError: (error: ApiError) => {
      console.log("error", error);
      if (!error) return;
      if (error.code === "VALIDATION_ERROR" && error.data?.details) {
        if (typeof error.data.details === "object") {
          Object.entries(error.data.details).forEach(([field, messages]) => {
            const msgArray = messages as string[];
            if (msgArray.length > 0) {
              onErrorCallback(msgArray[0], field);
            }
          });
          return;
        }

        const code = error.data?.code;
        if (code === "auth/email-already-exists") {
          onErrorCallback(code, error.data.field);
          return;
        }
      }

      if (error.code === "CONFLICT" && error.data?.field) {
        onErrorCallback(error.data.code || "username_taken", error.data.field);
        return;
      }
      onErrorCallback(error.message || "default");
    },
  });

  const handleRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return {
    handleRegister,
    isLoading: registerMutation.isPending,
  };
}
