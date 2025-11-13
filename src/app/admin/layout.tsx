import type { Metadata } from "next";
import { Layout } from "@/features/shared/components/layout/Layout";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserData = await getUserFromSession();

  const isAdmin = sessionUserData?.role === "admin";

  return isAdmin ? (
    <div className="w-screen ">{children}</div>
  ) : (
    <div className="text-white">:/</div>
  );
}
