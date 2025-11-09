import { UserProfileCard } from "@/features/users/components/UserProfileCard";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <UserProfileCard username={name} />;
}
