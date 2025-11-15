import { UserProfileCard } from "@/features/users/components/UserProfileCard";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const user = await getUserFromSession();
  const { name } = await params;

  let enableSettings = false;

  if (user && user.name === name) enableSettings = true;

  return <UserProfileCard username={name} enableSettings={enableSettings} />;
}
