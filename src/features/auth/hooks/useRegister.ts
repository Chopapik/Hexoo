import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RegisterData, registerFields } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { FirebaseError } from "firebase/app";

type ErrorCallback = (errorCode: string, field: registerFields) => void;

export default function useRegister(onError: ErrorCallback) {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const sessionMutation = useMutation({
    mutationFn: async (data: {
      idToken: string;
      name: string;
      email: string;
      recaptchaToken: string;
    }) => {
      const response = await fetchClient.post("/auth/register", data);
      router.push("/");
      return response;
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Wystąpił błąd podczas finalizacji rejestracji.");
    },
  });

  const handleRegister = async (data: RegisterData) => {
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA nie jest jeszcze gotowa.");
      return;
    }

    try {
      const checkResponse = await fetchClient.post("/auth/check-username", {
        username: data.name,
      });
      const { available } = checkResponse;

      if (!available) {
        onError("CONFLICT", "name");
        return;
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        onError("CONFLICT", "name");
        return;
      }
      console.error("Failed to check username availability:", error);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
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
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;

        if (errorCode === "auth/email-already-in-use") {
          onError("auth/email-already-exists", "email");
        } else if (errorCode === "auth/weak-password") {
          onError("password_too_short", "password");
        }
      } else if (error instanceof ApiError) {
        const errorCode = error.code;

        if (errorCode === "CONFLICT") {
          onError(errorCode, "name");
          return;
        }
      } else {
        console.error("API Error during session creation:", error);
        toast.error("Wystąpił nieznany bład");
        return;
      }
    }
  };
  return {
    handleRegister,
    isLoading: sessionMutation.isPending,
  };
}
