import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../../../firebase";

export interface Message {
  type: "Dismiss" | "Warning" | "Success";
  text: string;
}

interface FieldErrors {
  userName: Message[];
  email: Message[];
  password: Message[];
  root?: string;
}

export default function useRegister() {
  interface RegisterData {
    userName: string;
    email: string;
    password: string;
  }

  const [registerData, setRegisterData] = useState<RegisterData>({
    userName: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    userName: [],
    email: [],
    password: [],
  });

  const checkPasswordQuality = (password: string): Message[] => {
    const messages: Message[] = [];

    if (password.length < 8)
      messages.push({
        type: "Dismiss",
        text: "Hasło jest za krótkie (min. 8 znaków)",
      });
    else {
      if (!/[A-Z]/.test(password))
        messages.push({
          type: "Warning",
          text: "Dodaj co najmniej jedną wielką literę",
        });
      if (!/[a-z]/.test(password))
        messages.push({
          type: "Warning",
          text: "Dodaj co najmniej jedną małą literę",
        });
      if (!/[0-9]/.test(password))
        messages.push({
          type: "Warning",
          text: "Dodaj co najmniej jedną cyfrę",
        });
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        messages.push({
          type: "Warning",
          text: "Dodaj co najmniej jeden znak specjalny",
        });

      const isStrong =
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (isStrong)
        messages.push({ type: "Success", text: "Hasło jest silne! ✓" });
    }

    return messages;
  };

  const validateField = (
    field: keyof RegisterData,
    value: string,
    isSubmit = false
  ): Message[] => {
    const messages: Message[] = [];

    switch (field) {
      case "userName":
        if (!value)
          messages.push({
            type: "Dismiss",
            text: "Nazwa użytkownika jest wymagana",
          });
        if (value.length < 3 && isSubmit)
          messages.push({
            type: "Dismiss",
            text: "Nazwa musi mieć co najmniej 3 znaki",
          });
        break;
      case "email":
        if (!value)
          messages.push({ type: "Dismiss", text: "Email jest wymagany" });
        if (isSubmit && !/^\S+@\S+\.\S+$/.test(value))
          messages.push({ type: "Dismiss", text: "Niepoprawny format email" });
        break;
      case "password":
        if (!value)
          messages.push({ type: "Dismiss", text: "Hasło jest wymagane" });
        else messages.push(...checkPasswordQuality(value));
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: messages }));
    return messages;
  };

  const updateField = (field: keyof RegisterData, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value, true);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    (["userName", "email", "password"] as (keyof RegisterData)[]).forEach(
      (field) => {
        const messages = validateField(field, registerData[field], true);
        if (messages.some((m) => m.type === "Dismiss")) isValid = false;
      }
    );
    return isValid;
  };

  const handleFirebaseError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setErrors((prev) => ({
          ...prev,
          email: [{ type: "Dismiss", text: "Email jest już używany" }],
        }));
        break;
      case "auth/invalid-email":
        setErrors((prev) => ({
          ...prev,
          email: [{ type: "Dismiss", text: "Niepoprawny adres email" }],
        }));
        break;
      case "auth/weak-password":
        setErrors((prev) => ({
          ...prev,
          password: [{ type: "Dismiss", text: "Hasło jest zbyt słabe" }],
        }));
        break;
      case "auth/too-many-requests":
        setErrors((prev) => ({
          ...prev,
          root: "Zbyt wiele prób. Spróbuj później",
        }));
        break;
      default:
        setErrors((prev) => ({ ...prev, root: "Wystąpił nieznany błąd" }));
    }
  };

  const handleRegister = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, root: undefined }));

    try {
      await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );
      return true;
    } catch (error) {
      if (error instanceof FirebaseError) handleFirebaseError(error);
      else setErrors((prev) => ({ ...prev, root: "Wystąpił nieznany błąd" }));
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
