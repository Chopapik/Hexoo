import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { UpdatePasswordData } from "../me.type";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { useI18n } from "@/i18n/useI18n";

type ErrorCallback = (errorCode: string, field?: string) => void;

type PasswordChangeErrorData = {
  passwordChanged?: boolean;
  reloginRequired?: boolean;
  details?: Record<string, string[]>;
};

function getPasswordChangeErrorData(
  error: ApiError,
): PasswordChangeErrorData | undefined {
  if (!error.data || typeof error.data !== "object") return undefined;
  return error.data as PasswordChangeErrorData;
}

export const useUpdatePassword = (onError: ErrorCallback) => {
  const { t } = useI18n();
  const { getRecaptchaToken } = useRecaptcha();

  const mutation = useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const token = await getRecaptchaToken("update_password");
      const payload = { ...data, recaptchaToken: token };

      await fetchClient.put("/me/password", payload);
    },

    onError: (error: ApiError) => {
      if (!(error instanceof ApiError)) {
        toast.error(t("common.unknown"));
        return;
      }

      const errorData = getPasswordChangeErrorData(error);

      if (errorData?.passwordChanged && errorData?.reloginRequired) {
        toast.success(t("settings.account.passwordChangedRelogin"));
        return;
      }

      if (error.code === "INVALID_CREDENTIALS") {
        onError("auth/wrong-password", "oldPassword");
        return;
      }

      if (error.code === "VALIDATION_ERROR") {
        const details = errorData?.details;

        if (details) {
          Object.keys(details).forEach((field) => {
            const messages = details[field];

            if (messages && messages.length > 0) {
              onError(messages[0], field);
            }
          });

          return;
        }
      }

      onError(error.code, "root");
    },

    onSuccess: () => {
      toast.success(t("settings.account.passwordChanged"));
    },
  });

  const handleUpdatePassword = async (
    data: UpdatePasswordData,
  ): Promise<boolean> => {
    try {
      await mutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    updatePassword: handleUpdatePassword,
    isPending: mutation.isPending,
  };
};
