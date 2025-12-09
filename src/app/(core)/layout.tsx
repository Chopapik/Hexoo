import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Layout } from "@/features/shared/components/layout/Layout";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { ApiError } from "@/lib/ApiError";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sessionUserData = null;

  try {
    sessionUserData = await getUserFromSession();
  } catch (error: unknown) {
    if (
      error instanceof ApiError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      sessionUserData = null;
    } else {
      throw error;
    }
  }

  return <Layout user={sessionUserData}>{children}</Layout>;
}
