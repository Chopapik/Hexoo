import type { Metadata } from "next";
import { cookies } from "next/headers";
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

  return <Layout user={sessionUserData}>{children}</Layout>;
}
