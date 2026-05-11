import { UserProfileCard } from "@/features/users/components/UserProfileCard";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { getUserProfile } from "@/features/users/api/services";
import { AppError } from "@/lib/AppError";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { UserPostList } from "@/features/users/components/UserPostList";

type Props = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const profileData = await getUserProfile(uid);

  if (!profileData || !profileData.user) {
    return {
      title: "Nie znaleziono profilu - Hexoo",
      robots: { index: false, follow: false },
    };
  }

  const { user } = profileData;

  return {
    title: `${user.name} - Profil Hexoo`,
    description: `Zobacz profil użytkownika ${user.name} w aplikacji Hexoo. Sprawdź posty i aktywność.`,
    openGraph: {
      title: `${user.name} na Hexoo`,
      description: `Profil użytkownika ${user.name}. Dołączył: ${
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      }`,
      images: user.avatarUrl ? [user.avatarUrl] : [],
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { uid } = await params;

  const profileData = await getUserProfile(uid);

  if (!profileData || !profileData.user) {
    notFound();
  }

  let user = null;
  try {
    user = await getUserFromSession();
  } catch (error: unknown) {
    if (
      error instanceof AppError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      user = null;
    } else {
      throw error;
    }
  }

  let enableSettings = false;
  if (user && user.uid === uid) enableSettings = true;

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      <UserProfileCard
        username={uid}
        enableEditProfile={enableSettings}
        initialUser={profileData.user}
      />

      <UserPostList userId={profileData.user.uid} />
    </div>
  );
}
