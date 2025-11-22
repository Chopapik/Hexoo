import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, LoginSchema } from "../types/auth.types";
import { useState } from "react";

export function useLoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleServerErrors = (errorCode: string, field?: string) => {
    if (field === "email" || field === "password") {
      setError(field, {
        type: "server",
        message: errorCode,
      });
    } else {
      setError("root", {
        type: "server",
        message: errorCode,
      });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    handleServerErrors,
  };
}
