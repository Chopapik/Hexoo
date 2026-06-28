import { updateProfile } from "@/features/me/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import type { UpdateProfileData } from "@/features/me/me.type";
import { assertImageUploadRequestSize } from "@/features/images/api/image-resource-limits";
import {
  assertAvatarUploadRateLimit,
  assertProfileUpdateRateLimit,
} from "@/lib/rateLimit";

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  await assertProfileUpdateRateLimit(session.uid);

  assertImageUploadRequestSize(req.headers);
  const formData = await req.formData();

  const name = formData.get("name")?.toString();
  const avatarFile = formData.get("avatarFile");

  const data: UpdateProfileData = {};
  if (name) data.name = name;
  if (avatarFile instanceof File) {
    await assertAvatarUploadRateLimit(session.uid);
    data.avatarFile = avatarFile;
  }

  const updated = await updateProfile(session, data);

  return handleSuccess(updated);
});
