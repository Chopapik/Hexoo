import type { Metadata } from "next";
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
  } catch (error: any) {
    if (
      error instanceof ApiError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      return <div className="text-white">:/</div>;
    }
    throw error;
  }

  const isAdmin = sessionUserData?.role === "admin";

  return isAdmin ? (
    <div className="w-full min-h-screen bg-page-background flex flex-col">
      {children}
    </div>
  ) : (
    <div className="text-white">:/</div>
  );
}
