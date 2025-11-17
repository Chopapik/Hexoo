import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { validateField, type FieldErrors } from "../utils/loginValidation";
import { useRouter } from "next/navigation";
import { setUser } from "../store/authSlice";
import { LoginData } from "../types/auth.types";
import axiosInstance from "@/lib/axiosInstance";
import { useAppDispatch } from "@/lib/store/hooks";
import { ApiError } from "@/lib/ApiError";

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

  const dispatch = useAppDispatch();

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
    onSuccess: (response) => {
      const user = response.data.user;
      dispatch(
        setUser({
          id: user.uid,
          name: user.name,
          email: user.email,
          role: user?.role,
          avatarUrl: user?.avatarUrl,
        })
      );
      router.push("/");
    },
    onError: (error: ApiError) => {
      setIsLoading(false);

      if (!error) return;

      if (error.code === "VALIDATION_ERROR") {
        setErrors((prev: any) => ({
          ...prev,
          root: "Niepoprawny email lub hasło",
        }));
      }
      if (error.code === "FORBIDDEN") {
        setErrors((prev: any) => ({
          ...prev,
          root: "Konto zablokowane",
        }));
      }
    },

    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleLogin = async (): Promise<boolean> => {
    const isValid = validateForm();
    if (!isValid) return false;
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
