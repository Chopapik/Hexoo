import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterData,
  registerFields,
  RegisterSchema,
} from "../types/auth.type";

export function useRegisterForm() {
  const {
    register,
    handleSubmit,

    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleServerErrors = (errorCode: string, field: registerFields) => {
    console.log(errorCode, field);
    setError(field, {
      type: "server",
      message: errorCode,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    handleServerErrors,
  };
}
