import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginData } from "../types/auth.type";
import fetchClient from "@/lib/fetchClient";
import { ApiError } from "@/lib/AppError";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
import toast from "react-hot-toast";

type ErrorCallback = (errorCode: string, field?: string, data?: any) => void;

export default function useLogin(onError: ErrorCallback) {
  const { getRecaptchaToken } = useRecaptcha();
  const router = useRouter();

  const sessionMutation = useMutation({
    mutationFn: async (payload: {
      idToken: string;
      recaptchaToken: string;
    }) => {
      const response = await fetchClient.post("/auth/login", payload);
      router.push("/");
      return response;
    },
    onError: (error: ApiError) => {
      if (!error) return;
      onError(error.code || "default");
    },
  });

  const handleLogin = async (data: LoginData) => {
    try {
      try {
        await fetchClient.post("/security/rate-limit");
      } catch (error: any) {
        if (error.status === 429) {
          onError(error.code || "SECURITY_LOCKOUT", "root", error.data);
          return;
        }
        throw error;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const recaptchaToken = await getRecaptchaToken("login");
      const idToken = await userCredential.user.getIdToken();

      if (recaptchaToken) {
        sessionMutation.mutate({ idToken, recaptchaToken });
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;

        if (
          errorCode === "auth/invalid-credential" ||
          errorCode === "auth/user-not-found" ||
          errorCode === "auth/wrong-password"
        ) {
          onError("INVALID_CREDENTIALS", "root");
        } else if (errorCode === "auth/too-many-requests") {
          onError("RATE_LIMIT", "root");
        } else if (errorCode === "auth/user-disabled") {
          onError("ACCOUNT_BANNED", "root");
        }
      } else {
        console.error(error);
        toast.error("Wystąpił nieznany błąd.");
      }
    }
  };

  return {
    handleLogin,
    isLoading: sessionMutation.isPending,
  };
}
