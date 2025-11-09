"use client";

import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppDispatch } from "../store/hooks";

import { setUser, clearUser, setReady } from "@/features/auth/store/authSlice";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { useUsers } from "@/features/users/hooks/useUsers";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { handleCriticalError } = useCriticalError();
  const { getUserByUid } = useUsers();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          let profile = null;
          try {
            profile = await getUserByUid(fbUser.uid);
            // console.log("pobrany profil:", profile);
          } catch (error) {
            const profileError = new Error(
              `Failed to fetch user profile: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            handleCriticalError(profileError);
            console.warn("Using Firebase data as fallback");
          }

          dispatch(
            setUser({
              id: fbUser.uid,
              name: profile?.name ?? fbUser.displayName ?? "",
              email: fbUser.email ?? "",
              role: profile?.role ?? "user",
              avatarUrl: profile?.avatarUrl,
            })
          );
        } else {
          dispatch(clearUser());
        }
        dispatch(setReady(true));
      } catch (error) {
        // Critical error for main auth flow
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown authentication error occurred";

        const criticalError = new Error(
          `AuthProvider main error: ${errorMessage}`
        );
        handleCriticalError(criticalError);

        // Ensure app is marked as ready even on error
        dispatch(setReady(true));
      }
    });

    return () => unsub();
  }, [dispatch, handleCriticalError]);

  return <>{children}</>;
}
