import { useForm } from "react-hook-form";
import { UpdatePasswordData, UpdatePasswordDataSchema } from "../me.type";
import { zodResolver } from "@hookform/resolvers/zod";

export default function useUpdatePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(UpdatePasswordDataSchema),
    defaultValues: {
      newPassword: "",
      reNewPassword: "",
      oldPassword: "",
    },
  });

  const handleErrorsMessages = (errorCode: string, field?: string) => {
    if (
      field === "oldPassword" ||
      field === "newPassword" ||
      field === "reNewPassword"
    ) {
      setError(field as keyof UpdatePasswordData, {
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
    reset,
    setError,
    handleErrorsMessages,
  };
}
