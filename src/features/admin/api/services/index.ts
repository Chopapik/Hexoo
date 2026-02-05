import type { SessionData } from "@/features/me/me.type";
import type { AdminUserCreate } from "@/features/admin/types/admin.type";
import { AdminService } from "./admin.service";

export const getAdminService = (session: SessionData | null): AdminService => {
  return new AdminService(session);
};

export async function adminDeleteUser(
  session: SessionData | null,
  uid: string,
) {
  const service = getAdminService(session);
  return await service.adminDeleteUser(uid);
}

export async function adminCreateUserAccount(
  session: SessionData | null,
  data: AdminUserCreate,
) {
  const service = getAdminService(session);
  return await service.adminCreateUserAccount(data);
}

export async function adminGetAllUsers(session: SessionData | null) {
  const service = getAdminService(session);
  return await service.adminGetAllUsers();
}

export async function adminUpdateUserAccount(
  session: SessionData | null,
  uid: string,
  data: { name?: string; email?: string; role?: string },
) {
  const service = getAdminService(session);
  return await service.adminUpdateUserAccount(uid, data);
}

export async function adminUpdateUserPassword(
  session: SessionData | null,
  uid: string,
  newPassword: string,
) {
  const service = getAdminService(session);
  return await service.adminUpdateUserPassword(uid, newPassword);
}

export { AdminService };
