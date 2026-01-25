import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";
import { CreatePostDto, CreatePostSchema } from "../types/post.dto";

export default function useCreatePostForm() {
  const {
    setValue,
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    formState,
    watch,
  } = useForm<CreatePostDto>({
    resolver: zodResolver(CreatePostSchema),
    mode: "onSubmit",
    defaultValues: {
      text: "",
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

  const checkFormat = (rawData: CreatePostDto) => {
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
  };
}
