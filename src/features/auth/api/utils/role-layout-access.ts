import { ApiError } from "@/lib/AppError";
import { notFound, redirect } from "next/navigation";
import { getUserFromSession } from "./session-user.service";
import type { SessionData } from "@/features/me/me.type";

type UnauthenticatedBehavior = "redirect-login" | "return-null";

type RoleLayoutAccessOptions = {
  allowedRoles: SessionData["role"][];
  unauthenticated: UnauthenticatedBehavior;
};

export async function getRoleLayoutSession({
  allowedRoles,
  unauthenticated,
}: RoleLayoutAccessOptions): Promise<SessionData | null> {
  let sessionUserData: SessionData;

  try {
    sessionUserData = await getUserFromSession();
  } catch (error: unknown) {
    if (
      error instanceof ApiError &&
      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
    ) {
      if (unauthenticated === "redirect-login") {
        redirect("/login");
      }

      return null;
    }

    throw error;
  }

  if (!allowedRoles.includes(sessionUserData.role)) {
    notFound();
  }

  return sessionUserData;
}
