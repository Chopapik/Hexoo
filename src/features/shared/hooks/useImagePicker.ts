import { useState, useRef, useEffect, ChangeEvent, useCallback } from "react";

interface UseImagePickerProps {
  initialPreview?: string | null;
  onImageChanged?: (file: File | undefined) => void;
}

export function useImagePicker({
  initialPreview = null,
  onImageChanged,
}: UseImagePickerProps = {}) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPreview
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      const url = URL.createObjectURL(file);
      setImagePreview(url);

      if (onImageChanged) {
        onImageChanged(file);
      }
    },
    [imagePreview, onImageChanged]
  );

  const removeImage = useCallback(() => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onImageChanged) {
      onImageChanged(undefined);
    }
  }, [imagePreview, onImageChanged]);

  const triggerPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    imagePreview,
    fileInputRef,
    handleFileChange,
    removeImage,
    triggerPicker,
  };
}
