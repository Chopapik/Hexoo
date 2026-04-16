import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileData, UpdateProfileSchema } from "../me.type";
import { PublicUserResponseDto } from "@/features/users/types/user.dto";
import { useEffect, useRef, useState } from "react";

export function useUpdateProfileForm(user: PublicUserResponseDto | null) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    // Validate on change so that the UI (counter, icon, messages)
    // reacts immediately when the name becomes too short/too long
    // or contains invalid characters.
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      avatarFile: undefined,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.avatarUrl ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const revokeBlobPreviewIfNeeded = (preview: string | null) => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
  };

  useEffect(() => {
    if (user) {
      setImagePreview((prev) => {
        revokeBlobPreviewIfNeeded(prev);
        return user.avatarUrl ?? null;
      });
      reset({ name: user.name, avatarFile: undefined });
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      revokeBlobPreviewIfNeeded(imagePreview);
    };
  }, [imagePreview]);

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  const setCroppedAvatar = (file: File, previewUrl: string) => {
    setImagePreview((prev) => {
      revokeBlobPreviewIfNeeded(prev);
      return previewUrl;
    });
    clearErrors("avatarFile");
    setValue("avatarFile", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const validateAvatarFile = (file: File): boolean => {
    const parsed = UpdateProfileSchema.shape.avatarFile.safeParse(file);
    if (parsed.success) {
      clearErrors("avatarFile");
      return true;
    }

    const firstIssueMessage = parsed.error.issues[0]?.message ?? "wrong_file_type";
    setError("avatarFile", {
      type: "manual",
      message: firstIssueMessage,
    });
    return false;
  };

  const clearSelectedAvatar = () => {
    setImagePreview((prev) => {
      revokeBlobPreviewIfNeeded(prev);
      return null;
    });
    setValue("avatarFile", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
    clearErrors("avatarFile");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleServerErrors = (errorCode: string, field?: string) => {
    if (field === "name") {
      setError("name", { type: "server", message: errorCode });
    } else if (field === "avatarFile") {
      setError("avatarFile", { type: "server", message: errorCode });
    } else {
      setError("root", { type: "server", message: errorCode });
    }
  };

  const prepareFormData = (data: UpdateProfileData): FormData | null => {
    const formData = new FormData();
    let hasChanges = false;

    if (data.name && data.name.trim() !== user?.name) {
      formData.append("name", data.name.trim());
      hasChanges = true;
    }

    if (data.avatarFile instanceof File) {
      formData.append("avatarFile", data.avatarFile);
      hasChanges = true;
    }

    return hasChanges ? formData : null;
  };

  return {
    register,
    handleSubmit,
    errors,
    isDirty,
    handleServerErrors,
    prepareFormData,
    imagePreview,
    fileInputRef,
    triggerPicker,
    setCroppedAvatar,
    validateAvatarFile,
    clearSelectedAvatar,
    watch,
  };
}
