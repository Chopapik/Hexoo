import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Biblioteka do detekcji
import { osName, browserName, isMobile, isTablet } from "react-device-detect";
import type { CreatePost } from "../types/post.type";
import { CreatePostSchema } from "../types/post.type";

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
      // device: {
      //   type: "Desktop",
      //   os: "Unknown",
      //   browser: "Unknown",
      // },
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
    const safeOs = osName.slice(0, 50);
    const safeBrowser = browserName.slice(0, 50);
    // const deviceInfo: DeviceInfo = {
    //   type: deviceType,
    //   os: safeOs,
    //   browser: safeBrowser,
    // };
    // setValue("device", deviceInfo);
  }, [setValue]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setValue("imageFile", file, { shouldValidate: true });
  };

  const removeImage = () => {
    clearErrors("imageFile");
    setValue("imageFile", undefined);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const checkFormat = (data?: CreatePost): CreatePost | FormData => {
    const values = data ?? getValues();
    const imageFile = values.imageFile as unknown as File | undefined;
    const text = values.text ?? "";
    // const currentDevice = values.device ?? {
    //   type: "Desktop",
    //   os: "Unknown",
    //   browser: "Unknown",
    // };
    if (imageFile instanceof File) {
      const fd = new FormData();
      if (text) fd.append("text", text);
      // fd.append("device", JSON.stringify(currentDevice));
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
  };
}
