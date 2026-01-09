import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileData, UpdateProfileSchema } from "../me.type";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";
import { UserProfile } from "@/features/users/types/user.type";
import { useEffect } from "react";

export function useUpdateProfileForm(user: UserProfile | null) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: user?.name || "",
      avatarFile: undefined,
    },
  });

  const { imagePreview, fileInputRef, handleFileChange, triggerPicker } =
    useImagePicker({
      initialPreview: user?.avatarUrl,
      onImageChanged: (file) => {
        setValue("avatarFile", file, {
          shouldValidate: true,
          shouldDirty: true,
        });
      },
    });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, avatarFile: undefined });
    }
  }, [user, reset]);

  const handleServerErrors = (errorCode: string, field?: string) => {
    if (field === "name") {
      setError("name", { type: "server", message: errorCode });
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
    handleFileChange,
    triggerPicker,
  };
}
