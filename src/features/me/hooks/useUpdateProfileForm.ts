import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileData, UpdateProfileSchema } from "../me.type";
import { useImagePicker } from "@/features/shared/hooks/useImagePicker";
import { UserProfileDto } from "@/features/users/types/user.dto";
import { useEffect } from "react";

export function useUpdateProfileForm(user: UserProfileDto | null) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
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

  const { imagePreview, fileInputRef, handleFileChange, triggerPicker, removeImage } =
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

  const handleRemoveImage = () => {
    removeImage();
    setValue("avatarFile", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
    handleRemoveImage,
    watch,
  };
}
