import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { uploadImage, deleteImage } from "@/features/images/api/image.service";
import { enforceStrictModeration } from "@/features/moderation/utils/assessSafety";
import { logActivity } from "@/features/activity/api/services";
import { UpdateProfileData, UpdateProfileSchema } from "../../me.type";
import type { SessionData, UpdatePasswordData } from "../../me.type";
import type { UpdateUserPayload } from "@/features/users/types/user.payload";
import type { MeService as IMeService } from "./me.service.interface";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

export class MeService implements IMeService {
  constructor(
    private readonly session: SessionData,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async deleteAccount() {
    const decoded = this.session;

    await logActivity(
      decoded.uid,
      "USER_DELETED",
      "User deleted their own account",
    );

    await this.userRepository.deleteUser(decoded.uid);
    await this.authRepository.deleteUser(decoded.uid);
  }

  async updateProfile(data: UpdateProfileData) {
    const decoded = this.session;
    const uid = decoded.uid;

    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[meService.updateProfile] Błąd walidacji danych profilu.",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { name, avatarFile } = parsed.data;

    if (!name && !avatarFile) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[meService.updateProfile] Brak danych do aktualizacji.",
        details: { field: "root", reason: "no_update_fields" },
      });
    }

    await enforceStrictModeration(
      uid,
      name,
      avatarFile,
      "meService.updateProfile", 
    );

    const userData = await this.userRepository.getUserByUid(uid);
    const currentStoragePath = userData?.avatarMeta?.storagePath;

    const authUpdate: { displayName?: string; photoURL?: string } = {};
    const dbUpdate: UpdateUserPayload = { updatedAt: new Date() };

    if (name) {
      authUpdate.displayName = name;
      dbUpdate.name = name;
    }

    if (avatarFile) {
      const uploadResult = await uploadImage(avatarFile, uid, "avatars");

      if (currentStoragePath) {
        await deleteImage(currentStoragePath);
      }

      authUpdate.photoURL = uploadResult.publicUrl;
      dbUpdate.avatarUrl = uploadResult.publicUrl;
      dbUpdate.avatarMeta = {
        storagePath: uploadResult.storagePath,
        contentType: uploadResult.contentType,
        sizeBytes: uploadResult.sizeBytes,
      };
    }

    if (Object.keys(authUpdate).length > 0) {
      await this.authRepository.updateUser(uid, authUpdate);
    }

    await this.userRepository.updateUser(uid, dbUpdate);

    await logActivity(
      uid,
      "PROFILE_UPDATED",
      `Profile updated: ${name ? "name" : ""}${
        name && avatarFile ? ", " : ""
      }${avatarFile ? "avatar" : ""}`,
    );

    return {
      uid,
      email: decoded.email,
      role: decoded.role,
      name: (dbUpdate.name as string) ?? decoded.name,
      avatarUrl: (dbUpdate.avatarUrl as string | undefined) ?? decoded.avatarUrl,
      isRestricted: decoded.isRestricted,
      isBanned: decoded.isBanned,
    };
  }

  async updatePassword(passwordData: UpdatePasswordData) {
    const decoded = this.session;
    const { UpdatePasswordSchema } = await import("../../me.type");
    const parsed = UpdatePasswordSchema.safeParse(passwordData);

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[meService.updatePassword] Błąd walidacji hasła.",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { newPassword } = parsed.data;

    await this.authRepository.updateUser(decoded.uid, {
      password: newPassword,
    });

    await this.userRepository.updateUser(decoded.uid, {
      updatedAt: new Date(),
    });

    await logActivity(decoded.uid, "PASSWORD_CHANGED", "User changed password");
  }
}
