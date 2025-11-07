export type ValidationStatus = "Dismiss" | "Warning" | "Success";

export interface ValidationMessage {
  type: ValidationStatus;
  text: string;
}
