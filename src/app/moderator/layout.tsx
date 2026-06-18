import type { Metadata } from "next";
import { getRoleLayoutSession } from "@/features/auth/api/utils/role-layout-access";
import { UserRole } from "@/features/users/types/user.type";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserData = await getRoleLayoutSession({
    allowedRoles: [UserRole.Admin, UserRole.Moderator],
    unauthenticated: "return-null",
  });

  if (!sessionUserData) {
    return <div className="text-foreground-primary-default">:/</div>;
  }

  return (
    <div className="w-full min-h-screen bg-page-background-default flex flex-col">
      {children}
    </div>
  );
}
