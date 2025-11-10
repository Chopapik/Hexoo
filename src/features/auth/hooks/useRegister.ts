import { useState } from "react";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import {
  validateField,
  type FieldErrors,
} from "@/features/auth/utils/registerValidation";
import { useRouter } from "next/navigation";
import type { RegisterData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function useRegister() {
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    name: [],
    email: [],
    password: [],
  });

  const { handleCriticalError } = useCriticalError();

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) =>
      axiosInstance.post(`/api/user/create`, userData),
    onMutate: () => {
      setErrors({
        name: [],
        email: [],
        password: [],
      });
    },
    onSuccess: async (response) => {
      setIsLoading(false);

      const { token } = response.data;

      if (token) {
        try {
          await signInWithCustomToken(auth, token);
          router.push("/");
        } catch (error) {
          handleCriticalError(`Błąd podczas logowania`);
        }
      } else {
        handleCriticalError("Brak tokena w odpowiedzi");
      }
    },
    onError: (error: any) => {
      setIsLoading(false);
      if (error.response?.data) {
        const serverError = error.response.data;

        if (serverError.type === "validation" && serverError.data) {
          const { field, message } = serverError.data;
          setErrors((prev: any) => ({
            ...prev,
            [field]: [
              {
                text: message,
                type: "Dismiss",
              },
            ],
          }));
        } else if (serverError.type === "critical") {
          handleCriticalError(serverError.message);
        }
      } else {
        handleCriticalError("Wystąpił nieoczekiwany błąd");
      }
    },
  });

  const validateForm = (): boolean => {
    let isValid = true;
    (["name", "email", "password"] as const).forEach((field) => {
      const messages = validateField(field, registerData[field]);
      if (messages.some((m) => m.type === "Dismiss")) isValid = false;
      setErrors((prev: any) => ({ ...prev, [field]: messages }));
    });
    return isValid;
  };

  const updateField = (field: keyof RegisterData, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));

    const messages = validateField(field, value, false);
    setErrors((prev: any) => ({ ...prev, [field]: messages }));
  };

  const handleRegister = async (): Promise<void> => {
    const isValid = validateForm();

    if (isValid) {
      setIsLoading(true);
      registerMutation.mutate(registerData);
    }
  };

  return {
    registerData,
    updateField,
    handleRegister,
    isLoading,
    errors,
  };
}
