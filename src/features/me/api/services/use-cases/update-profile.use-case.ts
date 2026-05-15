import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { uploadImage, deleteImage } from "@/features/images/api/image.service";
import { enforceStrictModeration } from "@/features/moderation/utils/assessSafety";
import { logActivity } from "@/features/activity/api/services";
import { isUsernameTaken } from "@/features/auth/api/utils/checkUsernameUnique";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UpdateUserPayload } from "@/features/users/types/user.payload";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import {
  UpdateProfileData,
  UpdateProfileSchema,
  type SessionData,
} from "../../../me.type";

export class UpdateProfileUseCase {
  constructor(
    private readonly session: SessionData,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(data: UpdateProfileData) {
    const decoded = this.session;
    const uid = decoded.uid;

    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[UpdateProfileUseCase] Błąd walidacji danych profilu.",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { name, avatarFile } = parsed.data;

    if (!name && !avatarFile) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[UpdateProfileUseCase] Brak danych do aktualizacji.",
        details: { field: "root", reason: "no_update_fields" },
      });
    }

    const userData = await this.userRepository.getUserByUid(uid);

    if (name !== undefined) {
      const displayName = name.trim();

      if (!displayName) {
        throw createAppError({
          code: "VALIDATION_ERROR",
          message: "[UpdateProfileUseCase] Display name is required.",
          data: { field: "name" },
        });
      }

      if (await isUsernameTaken(displayName, uid)) {
        throw createAppError({
          code: "CONFLICT",
          message: `[UpdateProfileUseCase] Display name '${displayName}' is already taken.`,
          data: { field: "name" },
        });
      }
    }

    await enforceStrictModeration(
      uid,
      name,
      avatarFile,
      "UpdateProfileUseCase",
    );

    const authUpdate: { displayName?: string } = {};
    const dbUpdate: UpdateUserPayload = { updatedAt: new Date() };
    let savedAvatarMeta: ImageMeta | undefined;

    if (name) {
      const displayName = name.trim();
      authUpdate.displayName = displayName;
      dbUpdate.name = displayName;
    }

    if (avatarFile) {
      const uploadResult = await uploadImage(avatarFile, uid, "avatars");

      if (userData?.avatarMeta) {
        await deleteImage(userData.avatarMeta);
      }

      const avatarMeta: ImageMeta = {
        storageBucket: uploadResult.storageBucket,
        storageLocation: uploadResult.storageLocation,
        fileName: uploadResult.fileName,
        downloadToken: uploadResult.downloadToken,
        contentType: uploadResult.contentType,
        sizeBytes: uploadResult.sizeBytes,
      };
      savedAvatarMeta = avatarMeta;
      dbUpdate.avatarMeta = avatarMeta;
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
      avatarUrl: savedAvatarMeta
        ? (resolveImagePublicUrl(savedAvatarMeta) ?? undefined)
        : decoded.avatarUrl,
      isRestricted: decoded.isRestricted,
      isBanned: decoded.isBanned,
    };
  }
}
