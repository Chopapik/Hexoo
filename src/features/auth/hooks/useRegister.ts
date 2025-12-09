import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterData } from "../types/auth.type";
import axiosInstance from "@/lib/axiosInstance";
import { ApiError } from "@/lib/ApiError";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ErrorCallback = (errorCode: string, field?: string) => void;

export default function useRegister(onError: ErrorCallback) {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const sessionMutation = useMutation({
    mutationFn: (data: {
      idToken: string;
      name: string;
      email: string;
      recaptchaToken: string;
    }) => axiosInstance.post("/auth/register", data),

    onSuccess: () => {
      router.push("/");
    },

    onError: (error: ApiError) => {
      if (!error) return;

      if (error.code === "CONFLICT" && error.data?.field) {
        onError(error.data.code || "username_taken", error.data.field);
        return;
      }
      onError(error.message || "default");
    },
  });

  const handleRegister = async (data: RegisterData) => {
    if (!executeRecaptcha) {
      onError("reCAPTCHA nie jest jeszcze gotowa.", "root");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(userCredential.user, { displayName: data.name });

      const idToken = await userCredential.user.getIdToken();
      const recaptchaToken = await executeRecaptcha("register");

      sessionMutation.mutate({
        idToken,
        name: data.name,
        email: data.email,
        recaptchaToken,
      });
    } catch (error: any) {
      console.error("Client register error:", error);
      const errorCode = error.code;

      if (errorCode === "auth/email-already-in-use") {
        onError("auth/email-already-exists", "email");
      } else if (errorCode === "auth/weak-password") {
        onError("password_too_short", "password");
      } else {
        onError("default", "root");
      }
    }
  };

  return {
    handleRegister,
    isLoading: sessionMutation.isPending,
  };
}
