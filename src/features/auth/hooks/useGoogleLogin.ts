"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { supabaseClient } from "@/lib/supabaseClient";

/**
 * Kicks off Supabase OAuth (Google) sign-in from the browser.
 * Supabase will redirect the user to Google and then back to `/oauth/callback`,
 * where the session is picked up and forwarded to `/api/auth/oauth-login`.
 */
export default function useGoogleLogin() {
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
        toast.error(error.message ?? "Nie udało się zalogować przez Google.");
        setIsLoading(false);
      }
      // On success the browser is redirected to Google; keep isLoading=true.
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error("Wystąpił nieznany błąd podczas logowania przez Google.");
      setIsLoading(false);
    }
  }, []);

  return { handleGoogleLogin, isLoading };
}
