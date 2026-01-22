import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { UpdatePasswordData } from "../me.type";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppSelector } from "@/lib/store/hooks";
import { ApiError } from "@/lib/AppError";
import { FirebaseError } from "firebase/app";

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
    onSuccess: async (response, variables) => {
      if (!userEmail) return;

      try {
        const token = await getRecaptchaToken("change_password");
        const userCredential = await signInWithEmailAndPassword(
          auth,
          userEmail,
          variables.newPassword
        );
        const idToken = await userCredential.user.getIdToken();
        await fetchClient.post("/auth/login", {
          idToken,
          recaptchaToken: token,
        });
        toast.success("Hasło zmienione pomyślnie!");
      } catch (err) {
        console.error(err);
        toast.error("Hasło zmienione, ale wystąpił błąd logowania.");
      }
    },
  });

  const handleUpdatePassword = async (
    data: UpdatePasswordData
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;

    if (!userEmail || !currentUser) {
      toast.error(
        "Błąd: Brak adresu email użytkownika. Zaloguj się aby wykonać akcję."
      );
      return false;
    }

    const credential = EmailAuthProvider.credential(
      userEmail,
      data.oldPassword
    );

    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password"
        ) {
          onError("auth/wrong-password", "oldPassword");
        } else if (error.code === "auth/too-many-requests") {
          toast.error("Zbyt wiele prób. Spróbuj później.");
        } else {
          toast.error("Nie udało się zweryfikować starego hasła.");
        }
        return false;
      }
      console.error(error);
      toast.error("Wystąpił nieoczekiwany błąd.");
    }

    await mutation.mutateAsync(data);
    return true;
  };

  return {
    updatePassword: handleUpdatePassword,
    isPending: mutation.isPending,
  };
};
