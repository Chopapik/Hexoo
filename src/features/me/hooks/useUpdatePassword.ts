import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { UpdatePasswordData } from "../me.type";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppSelector } from "@/lib/store/hooks";

// type ErrorCallback = (errorCode: string, field?: string) => void;

export const useUpdatePassword = () => {
  const { getRecaptchaToken } = useRecaptcha();

  const userEmail = useAppSelector((state) => state.auth.user?.email);

  const mutation = useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const token = await getRecaptchaToken("update_password");
      const payload = { ...data, recaptchaToken: token };
      await axiosInstance.put(`/me/password`, payload);
    },
    onError: (error: any) => {
      if (error.code) {
        toast.error(error.code);
      } else {
        toast.error("wystapił nienzany błąd");
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
        await axiosInstance.post("/auth/login", {
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

  const handleUpdatePassword = async (data: UpdatePasswordData) => {
    if (!userEmail) {
      toast.error(
        "Błąd: Brak adresu email użytkownika. Zaloguj się aby wykonac akcję."
      );
      return;
    }
    mutation.mutateAsync(data);
  };

  return {
    updatePassword: handleUpdatePassword,
    isPending: mutation.isPending,
  };
};
