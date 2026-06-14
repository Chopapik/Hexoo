"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/features/shared/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email") ?? "";
    setEmail(emailFromUrl);
  }, []);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error(t("auth.verify.emailRequired"));
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }
    } catch (error) {
      console.error("Resend confirmation error:", error);
      toast.error(t("auth.verify.resendError"));
    } finally {
      setIsResending(false);
      toast.success(t("auth.verify.resendSuccess"));
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-4 py-8 text-center max-sm:bg-transparent sm:gap-6 sm:rounded-[20px] sm:p-10 sm:border sm:border-surface-card-border-default sm:bg-surface-card-background-default">
        <div className="text-foreground-primary-default text-2xl font-bold font-serif">
          {t("auth.verify.title")}
        </div>

        <div className="text-foreground-secondary-default text-base font-semibold font-sans">
          {t("auth.verify.copy")}
        </div>

        <p className="text-foreground-secondary-default text-sm font-normal font-sans">
          {t("auth.verify.help")}
        </p>

        <span className="mt-4 w-full px-4 py-3 text-xl outline-none break-all text-foreground-primary-default font-bold">
          {email}
        </span>

        <Button
          text={t("auth.verify.resend")}
          onClick={handleResend}
          isLoading={isResending}
        />

        <Link
          href="/login"
          className="mt-2 text-sm underline text-foreground-secondary-default"
        >
          {t("common.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
