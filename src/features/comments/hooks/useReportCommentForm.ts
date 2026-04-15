import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReportCommentSchema,
  ReportCommentRequestDto,
} from "../types/comment.dto";

export default function useReportCommentForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReportCommentRequestDto>({
    resolver: zodResolver(ReportCommentSchema),
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
    handleServerErrors,
  };
}
