import type { Metadata } from "next";
import { Layout } from "@/features/shared/components/layout/Layout";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { getSessionCookie, getRefreshCookie } from "@/lib/session";
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

  const sessionCookie = await getSessionCookie();
  const refreshCookie = await getRefreshCookie();

  if (sessionCookie.session && sessionCookie.value) {
    try {
      sessionUserData = await getUserFromSession();
      // Sliding: cookies are re-set from client via GET /api/auth/slide (Route Handler)
    } catch (error: unknown) {
      if (
        error instanceof AppError &&
        (error.code === "INVALID_SESSION" || error.code === "USER_NOT_FOUND")
      ) {
        // JWT expired; refresh runs in Route Handler where cookies can be set
        redirect("/api/auth/refresh");
      }
      if (error instanceof AppError && error.code === "AUTH_REQUIRED") {
        sessionUserData = null;
      } else {
        throw error;
      }
    }
  } else if (refreshCookie.hasRefresh) {
    redirect("/api/auth/refresh");
  }

  const serializedSession = JSON.stringify({
    sessionUser: sessionUserData,
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script
        id="__hexoo-bootstrap__"
        dangerouslySetInnerHTML={{
          __html: `window.__HEXOO_BOOTSTRAP__ = ${serializedSession};`,
        }}
      />
      <Layout>{children}</Layout>
    </>
  );
}
