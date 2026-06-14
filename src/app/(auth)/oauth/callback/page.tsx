"use client";

import useOAuthCallback from "@/features/auth/hooks/useOAuthCallback";
import { useI18n } from "@/i18n/useI18n";

export default function OAuthCallbackPage() {
  const { t } = useI18n();
  useOAuthCallback();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-4 py-8 max-sm:bg-transparent sm:rounded-[20px] sm:px-10 sm:py-8 sm:border sm:border-surface-card-border-default sm:bg-surface-card-background-default">
        <div className="text-foreground-primary-default text-2xl font-bold font-serif">
          {t("auth.oauth.callbackTitle")}
        </div>
        <div className="text-foreground-secondary-default text-base font-semibold font-sans">
          {t("auth.oauth.callbackCopy")}
        </div>
      </div>
    </div>
  );
}
