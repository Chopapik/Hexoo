"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

import { supabaseClient } from "@/lib/supabaseClient";
import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";
import type { SessionData } from "@/features/me/me.type";

type RegisterResponse = {
  user: SessionData;
};

export default function AuthConfirmPage() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const setUser = useAppStore((s) => s.setUser);
  const [message, setMessage] = useState("Potwierdzamy Twój email...");

  useEffect(() => {
    if (!executeRecaptcha) return;

    const confirmEmail = async () => {
      const params = new URLSearchParams(window.location.search);

      const tokenHash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;

      if (!tokenHash || !type) {
        setMessage("Link aktywacyjny jest nieprawidłowy.");
        return;
      }

      const lockKey = `hexoo-auth-confirm-${tokenHash}`;

      if (sessionStorage.getItem(lockKey)) {
        return;
      }

      sessionStorage.setItem(lockKey, "1");

      try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error || !data.session) {
          console.error("verifyOtp error:", error);
          setMessage("Nie udało się potwierdzić emaila. Link mógł wygasnąć.");
          return;
        }

        const user = data.user ?? data.session.user;
        const email = user.email;
        const name = user.user_metadata?.name;

        if (!email || !name) {
          setMessage(
            "Brakuje danych konta. Spróbuj zarejestrować się ponownie.",
          );
          return;
        }

        setMessage("Email potwierdzony.");

        const recaptchaToken = await executeRecaptcha("register_confirm");

        const response = await fetchClient.post<RegisterResponse>(
          "/auth/register",
          {
            idToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            name,
            email,
            recaptchaToken,
          },
        );

        setUser(response.user);
        toast.success("Konto aktywowane.");
        router.replace("/");
      } catch (error) {
        console.error("Email confirmation finalize error:", error);
        setMessage("Wystąpił błąd podczas aktywacji konta.");
      }
    };

    void confirmEmail();
  }, [executeRecaptcha, router, setUser]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="px-10 py-8 rounded-[20px] glass-card bg-neutral-500/5 flex flex-col items-center gap-4 text-center max-w-md">
        <div className="text-text-main text-2xl font-bold font-Plus_Jakarta_Sans">
          Aktywacja konta
        </div>
        <div className="text-text-neutral text-base font-semibold font-Plus_Jakarta_Sans">
          {message}
        </div>
      </div>
    </div>
  );
}
