import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ModerationReasonSchema,
  ModerationReasonFormData,
} from "../types/moderator.dto";

type ModerationAction = "quarantine" | "reject" | "reject-ban";

export default function useModerationReasonForm(action: ModerationAction) {
  type ModerationReasonFormInput = z.input<typeof ModerationReasonSchema>;
  const formAction = action === "reject-ban" ? "reject" : action;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isValid, isSubmitted },
  } = useForm<ModerationReasonFormInput>({
    resolver: zodResolver(ModerationReasonSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      action: formAction,
      justification: "",
      banAuthor: action === "reject-ban",
      categories: [],
    },
  });

  const justification = watch("justification") ?? "";

  const selectPreset = (preset: string) => {
    setValue("justification", preset, { shouldValidate: true });
  };

  const updateJustification = (value: string) => {
    setValue("justification", value, { shouldValidate: true });
  };

  const handleServerErrors = (errorCode: string) => {
    if (
      errorCode === "justification_too_short" ||
      errorCode === "justification_too_long"
    ) {
      setError("justification", { type: "server", message: errorCode });
    } else {
      setError("root", { type: "server", message: errorCode });
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    errors,
    isValid,
    isSubmitted,
    justification,
    selectPreset,
    updateJustification,
    handleServerErrors,
  };
}
