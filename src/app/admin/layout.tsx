import type { Metadata } from "next";
import { getRoleLayoutSession } from "@/features/auth/api/utils/role-layout-access";
import { UserRole } from "@/features/users/types/user.type";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getRoleLayoutSession({
    allowedRoles: [UserRole.Admin],
    unauthenticated: "redirect-login",
  });

  return (
    <div className="w-full min-h-screen bg-page-background-default flex flex-col">
      {children}
    </div>
  );
}
