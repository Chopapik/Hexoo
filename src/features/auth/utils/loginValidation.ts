import { FirebaseError } from "firebase/app";

export interface Message {
  type: "Dismiss" | "Warning" | "Success";
  text: string;
}

export interface FieldErrors {
  email: Message[];
  password: Message[];
  root?: string;
}

export const validateField = (
  field: "email" | "password",
  value: string,
  isSubmit = false
): Message[] => {
  const messages: Message[] = [];

  switch (field) {
    case "email":
      if (!value) messages.push({ type: "Dismiss", text: "Email is required" });
      if (isSubmit && !/^\S+@\S+\.\S+$/.test(value))
        messages.push({ type: "Dismiss", text: "Email format is invalid" });
      break;
    case "password":
      if (!value)
        messages.push({ type: "Dismiss", text: "Password is required" });

      break;
  }

  return messages;
};

export const handleFirebaseError = (error: FirebaseError): FieldErrors => {
  const fieldErrors: FieldErrors = { email: [], password: [] };

  if (error.code === "auth/invalid-credential") {
    fieldErrors.root = "Email lub hasło niepoprawne";
  }

  return fieldErrors;
};
