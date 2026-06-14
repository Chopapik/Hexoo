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
import { useI18n } from "@/i18n/useI18n";

type RegisterResponse = {
  user: SessionData;
};

export default function AuthConfirmPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const setUser = useAppStore((s) => s.setUser);
  const [message, setMessage] = useState(t("auth.confirm.pending"));

  useEffect(() => {
    if (!executeRecaptcha) return;

    const confirmEmail = async () => {
      const params = new URLSearchParams(window.location.search);

      const tokenHash = params.get("token_hash");
      const type = params.get("type") as EmailOtpType | null;

      if (!tokenHash || !type) {
        setMessage(t("auth.confirm.invalidLink"));
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
          setMessage(t("auth.confirm.failed"));
          return;
        }

        const user = data.user ?? data.session.user;
        const email = user.email;
        const name = user.user_metadata?.name;

        if (!email || !name) {
          setMessage(t("auth.confirm.missingData"));
          return;
        }

        setMessage(t("auth.confirm.confirmed"));

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
        toast.success(t("auth.confirm.activated"));
        router.replace("/");
      } catch (error) {
        console.error("Email confirmation finalize error:", error);
        setMessage(t("auth.confirm.activationError"));
      }
    };

    void confirmEmail();
  }, [executeRecaptcha, router, setUser, t]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-4 py-8 text-center max-sm:bg-transparent sm:gap-6 sm:rounded-[20px] sm:px-10 sm:py-8 sm:border sm:border-surface-card-border-default sm:bg-surface-card-background-default">
        <div className="text-foreground-primary-default text-2xl font-bold font-serif">
          {t("auth.confirm.title")}
        </div>
        <div className="text-foreground-secondary-default text-base font-semibold font-serif">
          {message}
        </div>
      </div>
    </div>
  );
}
