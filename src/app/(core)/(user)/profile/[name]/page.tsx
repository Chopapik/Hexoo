import { UserProfileCard } from "@/features/users/components/UserProfileCard";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { ApiError } from "@/lib/AppError";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  let user = null;

  try {
    user = await getUserFromSession();
  } catch (error: unknown) {
    if (
      error instanceof ApiError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      user = null;
    } else {
      throw error;
    }
  }

  const { name } = await params;

  let enableSettings = false;

  if (user && user.name === name) enableSettings = true;

  return <UserProfileCard username={name} enableSettings={enableSettings} />;
}
