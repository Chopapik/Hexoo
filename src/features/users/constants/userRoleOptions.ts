import { UserRole } from "@/features/users/types/user.type";

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const toUserRoleLabel = (role: UserRole) => titleCase(role);

const userRoles = Object.values(UserRole) as UserRole[];

export const USER_ROLE_OPTIONS = userRoles.map((role) => ({
  value: role,
  label: toUserRoleLabel(role),
}));
