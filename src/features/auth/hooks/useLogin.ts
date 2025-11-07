import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import {
  validateField,
  type FieldErrors,
  handleFirebaseError,
} from "../utils/loginValidation";
import { useRouter } from "next/navigation";
import { LoginInputs } from "../types/auth.types";
import { useActionLogger } from "@/features/actions/useActions";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function useLogin() {
  const [loginData, setLoginData] = useState<LoginInputs>({
    email: "",
    password: "",
  });
  const router = useRouter();

  const { logAction } = useActionLogger(db);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    email: [],
    password: [],
  });

  const { handleCriticalError } = useCriticalError();

  const updateField = (field: keyof LoginInputs, value: string) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const fieldErrors = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    (["email", "password"] as const).forEach((field) => {
      const messages = validateField(field, loginData[field]);
      if (messages.some((m) => m.type === "Dismiss")) isValid = false;
      setErrors((prev) => ({ ...prev, [field]: messages }));
    });
    return isValid;
  };

  const handleLogin = async (): Promise<boolean> => {
    const isValid = validateForm();
    if (!isValid) return false;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, root: undefined }));

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      const firebaseUser = userCredential.user;

      try {
        const res = await logAction({
          actionType: "user.login",
          userId: firebaseUser.uid,
          username: firebaseUser.displayName ?? null,
          status: "success",
          message: "User successfully logged in",
          meta: {
            email: loginData.email,
            loginTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        });

        if (!res.ok) {
          console.warn("logAction (login) failed:", res.error);
        }
      } catch (e) {
        console.error("Unexpected error when logging login action:", e);
      }

      router.push("/");
      return true;
    } catch (error) {
      try {
        const res = await logAction({
          actionType: "user.login",
          userId: "unknown",
          username: null,
          status: "error",
          message: error instanceof Error ? error.message : "Login failed",
          meta: {
            email: loginData.email,
            error: error instanceof FirebaseError ? error.code : "unknown",
            userAgent: navigator.userAgent,
          },
        });

        if (!res.ok) {
          console.warn("logAction (login error) failed:", res.error);
        }
      } catch (e) {
        console.error("Unexpected error when logging login error:", e);
      }

      if (error instanceof FirebaseError) {
        const firebaseErrors = handleFirebaseError(error);
        setErrors(firebaseErrors);
      } else if (error instanceof Error) {
        handleCriticalError(error);
      } else {
        const unknownError = new Error(
          "Wystąpił nieznany błąd podczas logowania"
        );
        handleCriticalError(unknownError);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginData,
    updateField,
    handleLogin,
    isLoading,
    errors,
  };
}
