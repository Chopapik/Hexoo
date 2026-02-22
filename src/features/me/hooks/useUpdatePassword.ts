import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { UpdatePasswordData } from "../me.type";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppSelector } from "@/lib/store/hooks";
import { ApiError } from "@/lib/AppError";

type ErrorCallback = (errorCode: string, field?: string) => void;

export const useUpdatePassword = (onError: ErrorCallback) => {
  const { getRecaptchaToken } = useRecaptcha();
  const userEmail = useAppSelector((state) => state.auth.user?.email);

  const mutation = useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const token = await getRecaptchaToken("update_password");
      const payload = { ...data, recaptchaToken: token };
      await fetchClient.put(`/me/password`, payload);
    },
    onError: (error: ApiError) => {
      if (error.code) {
        toast.error(error.code);
      } else {
        toast.error("wystąpił nieznany błąd");
      }
    },
    onSuccess: async (_response, variables) => {
      if (!userEmail) return;

      try {
        const token = await getRecaptchaToken("change_password");
        const { data: signInData, error: signInError } =
          await supabaseClient.auth.signInWithPassword({
            email: userEmail,
            password: variables.newPassword,
          });

        if (signInError || !signInData.session?.access_token) {
          toast.success("Hasło zmienione. Zaloguj się ponownie.");
          return;
        }

        await fetchClient.post("/auth/login", {
          idToken: signInData.session.access_token,
          recaptchaToken: token,
        });
        toast.success("Hasło zmienione pomyślnie!");
      } catch (err) {
        console.error(err);
        toast.success("Hasło zmienione. Zaloguj się ponownie.");
      }
    },
  });

  const handleUpdatePassword = async (
    data: UpdatePasswordData
  ): Promise<boolean> => {
    if (!userEmail) {
      toast.error(
        "Błąd: Brak adresu email użytkownika. Zaloguj się aby wykonać akcję."
      );
      return false;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: userEmail,
        password: data.oldPassword,
      });

      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (
          msg.includes("invalid") ||
          msg.includes("credentials") ||
          msg.includes("invalid_login_credentials")
        ) {
          onError("auth/wrong-password", "oldPassword");
        } else if (msg.includes("too many") || msg.includes("rate")) {
          toast.error("Zbyt wiele prób. Spróbuj później.");
        } else {
          toast.error("Nie udało się zweryfikować starego hasła.");
        }
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Wystąpił nieoczekiwany błąd.");
      return false;
    }

    await mutation.mutateAsync(data);
    return true;
  };

  return {
    updatePassword: handleUpdatePassword,
    isPending: mutation.isPending,
  };
};
