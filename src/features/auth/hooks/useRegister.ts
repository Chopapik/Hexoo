import { useState } from "react";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import {
  validateField,
  type FieldErrors,
} from "@/features/auth/utils/registerValidation";
import type { RegisterData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/ApiError";

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
      axiosInstance.post(`/auth/register`, userData),
    onMutate: () => {
      setErrors({
        name: [],
        email: [],
        password: [],
      });
    },
    onSuccess: async () => {
      router.push("/");
    },
    onError: (error: ApiError) => {
      setIsLoading(false);
      if (!error) return;

      if (error.code === "VALIDATION_ERROR" && error.details) {
        const code = error.details.code;
        const field = error.details.field ?? "root";

        switch (code) {
          case "auth/missing_fields": {
            setErrors((prev: any) => ({
              ...prev,
              root: [
                {
                  text: "Uzupełnij pola",
                },
              ],
            }));
          }
          case "auth/email-already-exists": {
            setErrors((prev: any) => ({
              ...prev,
              email: [
                {
                  text: "Ten Email jest już zajęty",
                  type: "Dismiss",
                },
              ],
            }));
          }
          case "auth/invalid-email": {
            setErrors((prev: any) => ({
              ...prev,
              email: [
                {
                  text: "Nieprawidłowy format adresu email",
                  type: "Dismiss",
                },
              ],
            }));
          }
          default: {
            setErrors((prev: any) => ({
              ...prev,
              root: [
                {
                  text: "Wystąpił błąd. Spróbuj ponownie poźniej lub skontaktuj sie z adminem :(",
                },
              ],
            }));
          }
        }
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
