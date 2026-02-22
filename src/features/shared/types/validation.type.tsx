export type ValidationStatus = "Default" | "Dismiss" | "Warning" | "Success";

export interface ValidationMessage {
  type: ValidationStatus;
  text: string;
  field?: string;
}
