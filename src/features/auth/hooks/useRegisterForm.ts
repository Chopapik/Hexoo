import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterData, RegisterSchema } from "../types/auth.type";

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

  const handleServerErrors = (errorCode: string, field?: string) => {
    if (field === "email" || field === "password" || field === "name") {
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
