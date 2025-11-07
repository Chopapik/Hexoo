import { FirebaseError } from "firebase/app";

export interface Message {
  type: "Dismiss" | "Warning" | "Success";
  text: string;
}

export interface FieldErrors {
  name: Message[];
  email: Message[];
  password: Message[];
  root?: string;
}

// Check password strength and rules
export const checkPasswordQuality = (password: string): Message[] => {
  const messages: Message[] = [];

  if (password.length < 8)
    messages.push({
      type: "Dismiss",
      text: "Password must be at least 8 characters",
    });
  else {
    if (!/[A-Z]/.test(password))
      messages.push({
        type: "Warning",
        text: "Add at least one uppercase letter",
      });
    if (!/[a-z]/.test(password))
      messages.push({
        type: "Warning",
        text: "Add at least one lowercase letter",
      });
    if (!/[0-9]/.test(password))
      messages.push({ type: "Warning", text: "Add at least one number" });
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      messages.push({
        type: "Warning",
        text: "Add at least one special character",
      });

    const isStrong =
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (isStrong)
      messages.push({ type: "Success", text: "Password is strong" });
  }

  return messages;
};

// Validate single field
export const validateField = (
  field: "name" | "email" | "password",
  value: string,
  isSubmit = false
): Message[] => {
  const messages: Message[] = [];

  switch (field) {
    case "name":
      if (!value) messages.push({ type: "Dismiss", text: "Name is required" });
      if (value.length < 3 && isSubmit)
        messages.push({
          type: "Dismiss",
          text: "Name must be at least 3 characters",
        });
      break;
    case "email":
      if (!value) messages.push({ type: "Dismiss", text: "Email is required" });
      if (isSubmit && !/^\S+@\S+\.\S+$/.test(value))
        messages.push({ type: "Dismiss", text: "Email format is invalid" });
      break;
    case "password":
      if (!value)
        messages.push({ type: "Dismiss", text: "Password is required" });
      else messages.push(...checkPasswordQuality(value));
      break;
  }

  return messages;
};

// Map Firebase errors to readable messages
export const handleFirebaseError = (error: FirebaseError): FieldErrors => {
  const fieldErrors: FieldErrors = { name: [], email: [], password: [] };

  switch (error.code) {
    case "auth/email-already-in-use":
      fieldErrors.email.push({
        type: "Dismiss",
        text: "Email is already in use",
      });
      break;
    case "auth/invalid-email":
      fieldErrors.email.push({
        type: "Dismiss",
        text: "Invalid email address",
      });
      break;
    case "auth/weak-password":
      fieldErrors.password.push({
        type: "Dismiss",
        text: "Password is too weak",
      });
      break;
    case "auth/too-many-requests":
      fieldErrors.root = "Too many requests. Try later.";
      break;
    default:
      fieldErrors.root = "An unknown error occurred";
  }

  return fieldErrors;
};
