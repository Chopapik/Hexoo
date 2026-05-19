"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { supabaseClient } from "@/lib/supabaseClient";
import { useI18n } from "@/i18n/useI18n";

/**
 * Kicks off Supabase OAuth (Google) sign-in from the browser.
 * Supabase will redirect the user to Google and then back to `/oauth/callback`,
 * where the session is picked up and forwarded to `/api/auth/oauth-login`.
 */
export default function useGoogleLogin() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const redirectTo =
        typeof window === "undefined"
          ? undefined
          : new URL("/oauth/callback", window.location.origin).toString();

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        toast.error(error.message ?? t("auth.oauth.googleLoginError"));
        setIsLoading(false);
      }
      // On success the browser is redirected to Google; keep isLoading=true.
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error(t("auth.oauth.googleUnknownError"));
      setIsLoading(false);
    }
  }, [t]);

  return { handleGoogleLogin, isLoading };
}
