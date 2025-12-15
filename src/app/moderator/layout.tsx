import type { Metadata } from "next";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { ApiError } from "@/lib/AppError";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Hexoo",
};

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sessionUserData = null;

  try {
    sessionUserData = await getUserFromSession();
  } catch (error: any) {
    if (
      error instanceof ApiError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      return <div className="text-white">:/</div>;
    }
    throw error;
  }

  if (
    sessionUserData?.role !== "admin" &&
    sessionUserData?.role !== "moderator"
  ) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-page-background flex flex-col">
      {children}
    </div>
  );
}
