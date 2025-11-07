import { useActionLogger } from "@/features/actions/useActions";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export default function useLogout() {
  const { logAction } = useActionLogger(db);

  const handleLogout = async (): Promise<void> => {
    try {
      const currentUser = auth.currentUser;

      await signOut(auth);

      if (currentUser) {
        try {
          const res = await logAction({
            actionType: "user.logout",
            userId: currentUser.uid,
            username: currentUser.displayName ?? currentUser.email ?? "Unknown",
            status: "success",
            message: "User logged out",
            meta: {
              logoutTime: new Date().toISOString(),
              userAgent: navigator.userAgent,
            },
          });

          if (!res.ok) {
            console.warn("logAction (logout) failed:", res.error);
          }
        } catch (e) {
          console.error("Unexpected error when logging logout action:", e);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);

      const u = auth.currentUser;
      if (u) {
        try {
          const res = await logAction({
            actionType: "user.logout",
            userId: u.uid,
            username: u.displayName ?? u.email ?? "Unknown",
            status: "error",
            message: error instanceof Error ? error.message : "Logout failed",
            meta: {
              userAgent: navigator.userAgent,
            },
          });

          if (!res.ok) {
            console.warn("logAction (logout error) failed:", res.error);
          }
        } catch (e) {
          console.error("Unexpected error when logging logout error:", e);
        }
      }

      throw error;
    }
  };
  return { handleLogout };
}
