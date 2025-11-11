import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { validateField, type FieldErrors } from "../utils/loginValidation";
import { useRouter } from "next/navigation";

import { LoginData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";

export default function useLogin() {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    email: [],
    password: [],
  });

  const { handleCriticalError } = useCriticalError();

  const updateField = (field: keyof LoginData, value: string) => {
    setLoginData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    const fieldErrors = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    (["email", "password"] as const).forEach((field) => {
      const messages = validateField(field, loginData[field]);
      if (messages.some((m) => m.type === "Dismiss")) isValid = false;
      setErrors((prev) => ({ ...prev, [field]: messages }));
    });
    return isValid;
  };

  const loginMutate = useMutation({
    mutationFn: (userData: LoginData) =>
      axiosInstance.post(`/auth/login`, userData),
    onMutate: () => {
      setIsLoading(true);
      setErrors((prev) => ({ ...prev, root: undefined }));
    },
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: any) => {
      setIsLoading(false);
      if (error.response?.data) {
        // console.log("error.response.data", error.response.data);
        const serverError = error.response.data;
        console.log("serverError", serverError.data);

        if (serverError.type === "validation" && serverError.data) {
          const { message } = serverError.data;
          setErrors((prev: any) => ({
            ...prev,
            root: message,
          }));
        } else if (serverError.type === "critical") {
          handleCriticalError(serverError.message);
        }
      } else {
        handleCriticalError("Wystąpił nieoczekiwany błąd");
      }
    },

    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleLogin = async (): Promise<boolean> => {
    const isValid = validateForm();
    if (!isValid) return false;

    // Uruchom mutację
    loginMutate.mutate(loginData);
    return true;
  };

  return {
    loginData,
    updateField,
    handleLogin,
    isLoading: isLoading || loginMutate.isPending,
    errors,
  };
}
