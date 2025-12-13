import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePost } from "../types/post.type";
import { CreatePostSchema } from "../types/post.type";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";

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
  } = useForm<CreatePost>({
    resolver: zodResolver(CreatePostSchema),
    mode: "onBlur",
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

  // Prepare FormData if image exists (for upload), otherwise return simple JSON object
  const checkFormat = (data?: CreatePost): CreatePost | FormData => {
    const values = data ?? getValues();
    const imageFile = values.imageFile as File | undefined;
    const text = values.text ?? "";

    if (imageFile instanceof File) {
      const fd = new FormData();
      if (text) fd.append("text", text);
      fd.append("imageFile", imageFile);
      return fd;
    }
    return { text } as CreatePost;
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
