import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddCommentRequestDto,
  AddCommentSchema,
} from "../types/comment.dto";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";

export default function useCommentForm(postId: string) {
  const {
    setValue,
    register,
    handleSubmit,
    reset,
    clearErrors,
    getValues,
    trigger,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddCommentRequestDto>({
    resolver: zodResolver(AddCommentSchema),
    defaultValues: {
      text: "",
      imageFile: undefined,
      postId: postId,
    },
  });

  const {
    imagePreview,
    fileInputRef,
    handleFileChange,
    removeImage: removePickerImage,
    triggerPicker,
  } = useImagePicker({
    onImageChanged: (file) => {
      if (file) {
        setValue("imageFile", file, { shouldValidate: true });
        clearErrors("text");
        trigger("imageFile");
        return;
      }

      setValue("imageFile", undefined, { shouldValidate: true });
      clearErrors("imageFile");
    },
  });

  const removeImage = () => {
    removePickerImage();
    clearErrors("imageFile");
  };

  const checkFormat = (rawData: AddCommentRequestDto) => {
    const values = rawData ?? getValues();
    const imageFile: File | undefined = values.imageFile;
    const text: string = values.text ?? "";
    const postId: string = values.postId;

    if (imageFile instanceof File) {
      const fd = new FormData();
      fd.append("text", text);
      fd.append("postId", postId);
      fd.append("imageFile", imageFile);
      return fd;
    }

    return { text, postId };
  };

  const resetForm = () => {
    reset();
    removeImage();
  };

  const handleServerErrors = (errorCode: string) => {
    const contentErrors = [
      "comment_empty",
      "comment_too_long",
      "file_too_big",
      "wrong_file_type",
    ];

    if (contentErrors.includes(errorCode)) {
      if (errorCode === "file_too_big" || errorCode === "wrong_file_type") {
        setError("imageFile", { type: "server", message: errorCode });
      } else {
        setError("text", { type: "server", message: errorCode });
      }
    } else {
      setError("root", { type: "server", message: errorCode });
    }
  };

  return {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    errors,
    isSubmitting,
    handleServerErrors,
    fileInputRef,
    imagePreview,
    removeImage,
    handleFileChange,
    checkFormat,
    triggerPicker,
  };
}
