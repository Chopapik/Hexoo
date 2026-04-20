import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OAuthCompleteData,
  OAuthCompleteFields,
  OAuthCompleteSchema,
} from "../types/auth.type";

export function useOAuthCompleteForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<OAuthCompleteData>({
    resolver: zodResolver(OAuthCompleteSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
    },
  });

  const watchedName = watch("name");

  const handleServerErrors = (errorCode: string, field?: OAuthCompleteFields) => {
    if (field === "name") {
      setError(field, { type: "server", message: errorCode });
    } else {
      setError("root", { type: "server", message: errorCode });
    }
  };

  return {
    register,
    handleSubmit,
    watch,
    watchedName,
    errors,
    isSubmitting,
    handleServerErrors,
    setError,
    clearErrors,
  };
}
