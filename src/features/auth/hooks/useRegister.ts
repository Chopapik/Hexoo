import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import {
  validateField,
  handleFirebaseError,
  type FieldErrors,
} from "@/features/auth/utils/registerValidation";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useActionLogger } from "@/features/actions/useActions";
import type { RegisterInputs } from "../types/auth.types";

export default function useRegister() {
  const [registerData, setRegisterData] = useState<RegisterInputs>({
    name: "",
    email: "",
    password: "",
  });

  const { logAction } = useActionLogger(db);

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    name: [],
    email: [],
    password: [],
  });

  const { handleCriticalError } = useCriticalError();

  const validateForm = (): boolean => {
    let isValid = true;
    (["name", "email", "password"] as const).forEach((field) => {
      const messages = validateField(field, registerData[field]);
      if (messages.some((m) => m.type === "Dismiss")) isValid = false;
      setErrors((prev) => ({ ...prev, [field]: messages }));
    });
    return isValid;
  };

  const updateField = (field: keyof RegisterInputs, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));

    const messages = validateField(field, value, false);
    setErrors((prev) => ({ ...prev, [field]: messages }));
  };

  const handleRegister = async (): Promise<boolean> => {
    const { name, email, password } = registerData;

    const isValid = validateForm();
    if (!isValid) return false;

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      if (
        firebaseUser &&
        firebaseUser.email &&
        firebaseUser.metadata.creationTime
      ) {
        const doc = {
          uid: firebaseUser.uid,
          name: name,
          email: firebaseUser.email,
          createdAt: firebaseUser.metadata.creationTime,
          role: "user",
        };

        await addDoc(collection(db, "users"), doc);
      }

      await logAction({
        actionType: "user.create",
        userId: firebaseUser.uid,
        username: registerData.name ?? firebaseUser.displayName ?? null,
        status: "success",
        message: "User successfully registered",
        meta: {
          email: registerData.email,
          registrationTime: new Date().toISOString(),
        },
      });

      router.push("/");
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) {
        const firebaseErrors = handleFirebaseError(error);
        setErrors(firebaseErrors);
      } else if (error instanceof Error) {
        handleCriticalError(error);
      } else {
        const unknownError = new Error("Wystąpił nieznany błąd");
        handleCriticalError(unknownError);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerData,
    updateField,
    handleRegister,
    isLoading,
    errors,
  };
}
