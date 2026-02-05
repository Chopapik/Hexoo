import { updateProfile } from "@/features/me/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const formData = await req.formData();

  const name = formData.get("name")?.toString();
  const avatarFile = formData.get("avatarFile");

  const data: any = {};
  if (name) data.name = name;
  if (avatarFile instanceof File) data.avatarFile = avatarFile;

  const updated = await updateProfile(session, data);

  return handleSuccess({ message: "Profile updated", data: updated });
});
