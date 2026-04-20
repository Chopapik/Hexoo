"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import fetchClient from "@/lib/fetchClient";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store/store";
import type { UserRole } from "@/features/users/types/user.type";

type OAuthLoginResponse =
  | {
      status: "LOGGED_IN";
      user: {
        uid: string;
        email?: string;
        name: string;
        role: UserRole;
        avatarUrl?: string;
      };
    }
  | {
      status: "NEEDS_USERNAME";
      uid: string;
      email?: string;
    };

type Phase = "initial" | "verifying" | "redirecting" | "error";

/**
 * Reads the Supabase session populated after Google redirects back,
 * forwards its access/refresh tokens to `/api/auth/oauth-login`,
 * then either goes to `/` (already onboarded) or `/oauth/complete-profile`.
 *
 * Handles the edge case where the user previously got stuck mid-onboarding:
 * the backend detects the pending DB record and signals NEEDS_USERNAME again.
 */
export default function useOAuthCallback() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const didRunRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("initial");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    (async () => {
      setPhase("verifying");

      try {
        const { data: sessionResult, error: sessionErr } =
          await supabaseClient.auth.getSession();

        if (sessionErr || !sessionResult.session) {
          setErrorCode("NO_SUPABASE_SESSION");
          setPhase("error");
          toast.error("Nie udało się pobrać sesji Google. Spróbuj ponownie.");
          router.replace("/login");
          return;
        }

        const { access_token: idToken, refresh_token: refreshToken } =
          sessionResult.session;

        const response = (await fetchClient.post("/auth/oauth-login", {
          idToken,
          refreshToken,
        })) as OAuthLoginResponse;

        if (response.status === "LOGGED_IN") {
          setUser({
            ...response.user,
            email: response.user.email ?? "",
          });
          setPhase("redirecting");
          router.replace("/");
          router.refresh();
          return;
        }

        // NEEDS_USERNAME -> keep the Supabase session alive in the browser
        // so the complete-profile page can read it again.
        setPhase("redirecting");
        router.replace("/oauth/complete-profile");
      } catch (err) {
        console.error("[useOAuthCallback]", err);
        setErrorCode("NETWORK_ERROR");
        setPhase("error");
        toast.error("Wystąpił błąd przy finalizacji logowania.");
        router.replace("/login");
      }
    })();
  }, [router, setUser]);

  return { phase, errorCode };
}
