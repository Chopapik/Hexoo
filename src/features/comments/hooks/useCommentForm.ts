import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddCommentDto, AddCommentSchema } from "../types/comment.type";

export default function useCommentForm(postId: string) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddCommentDto>({
    resolver: zodResolver(AddCommentSchema),
    defaultValues: {
      text: "",
      postId: postId,
    },
  });

  const handleServerErrors = (errorCode: string) => {
    const contentErrors = ["comment_empty", "comment_too_long"];
    console.log(errorCode);

    if (contentErrors.includes(errorCode)) {
      setError("text", { type: "server", message: errorCode });
    } else {
      setError("root", { type: "server", message: errorCode });
    }
  };

  return {
    register,
    handleSubmit,
    reset,
    watch,
    errors,
    isSubmitting,
    handleServerErrors,
  };
}
