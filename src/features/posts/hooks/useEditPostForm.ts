import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";
import { UpdatePostRequestDto, UpdatePostSchema } from "../types/post.dto";
import { PublicPostResponseDto } from "../types/post.dto";

export default function useEditPostForm(post: PublicPostResponseDto) {
  const {
    setValue,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    getValues,
    formState,
    watch,
    trigger,
  } = useForm<UpdatePostRequestDto>({
    resolver: zodResolver(UpdatePostSchema),
    mode: "onSubmit",
    defaultValues: {
      text: post.text,
      imageFile: undefined,
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
      } else {
        setValue("imageFile", undefined, { shouldValidate: true });
        clearErrors("imageFile");
      }
    },
  });

  const removeImage = () => {
    removePickerImage();
    clearErrors("imageFile");
  };

  const checkFormat = (rawData: UpdatePostRequestDto) => {
    const values = rawData ?? getValues();
    const imageFile: File | undefined = values.imageFile;
    const text: string = values.text ?? "";

    if (imageFile instanceof File) {
      const fd = new FormData();
      fd.append("text", text);
      fd.append("imageFile", imageFile);
      return fd;
    }
    return { text };
  };

  const resetForm = () => {
    reset({
      text: post.text,
      imageFile: undefined,
    });
    removeImage();
    clearErrors();
  };

  return {
    register,
    handleSubmit,
    fileInputRef,
    imagePreview,
    removeImage,
    handleFileChange,
    checkFormat,
    getValues,
    formState,
    setError,
    watch,
    clearErrors,
    triggerPicker,
    resetForm,
  };
}
