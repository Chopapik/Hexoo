import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ReportPostSchema } from "../types/post.dto";

type ReportPostFormInput = z.input<typeof ReportPostSchema>;

export default function useReportPostForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ReportPostFormInput>({
    resolver: zodResolver(ReportPostSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      reason: "spam",
      details: "",
    },
  });

  const handleServerErrors = (errorCode: string) => {
    setError("root", { type: "server", message: errorCode });
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    isSubmitting,
    isSubmitted,
    handleServerErrors,
  };
}
