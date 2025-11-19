import { UserProfileCard } from "@/features/users/components/UserProfileCard";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { ApiError } from "@/lib/ApiError";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  let user = null;

  try {
    user = await getUserFromSession();
  } catch (err: any) {
    if (
      err instanceof ApiError &&
      (err.code === "AUTH_REQUIRED" || err.code === "INVALID_SESSION")
    ) {
      user = null;
    } else {
      throw err;
    }
  }

  const { name } = await params;

  let enableSettings = false;

  if (user && user.name === name) enableSettings = true;

  return <UserProfileCard username={name} enableSettings={enableSettings} />;
}
