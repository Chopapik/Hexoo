import type { UserRole } from "../types/user.type";

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "user", label: "Użytkownik" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
];
