import type { Metadata } from "next";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/AppError";

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
      redirect("/login");
    }
    throw error;
  }

  if (sessionUserData?.role !== "admin") {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-page-background flex flex-col">
      {children}
    </div>
  );
}
