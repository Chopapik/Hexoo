"use client";

import useOAuthCallback from "@/features/auth/hooks/useOAuthCallback";

export default function OAuthCallbackPage() {
  useOAuthCallback();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-4 py-8 max-sm:bg-transparent sm:rounded-[20px] sm:px-10 sm:py-8 sm:glass-card">
        <div className="text-text-main text-2xl font-bold font-serif">
          Logowanie przez Google…
        </div>
        <div className="text-text-neutral text-base font-semibold font-sans">
          Za chwilę przekierujemy Cię dalej.
        </div>
      </div>
    </div>
  );
}
