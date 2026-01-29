import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Layout } from "@/features/shared/components/layout/Layout";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { AppError } from "@/lib/AppError";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sessionUserData = null;

  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.has("session");

  if (hasSessionCookie) {
    try {
      sessionUserData = await getUserFromSession();
    } catch (error: unknown) {
      if (
        error instanceof AppError &&
        (error.code === "INVALID_SESSION" || error.code === "USER_NOT_FOUND")
      ) {
        redirect("/login");
      }
      if (error instanceof AppError && error.code === "AUTH_REQUIRED") {
        sessionUserData = null;
      } else {
        throw error;
      }
    }
  }

  return <Layout user={sessionUserData}>{children}</Layout>;
}
