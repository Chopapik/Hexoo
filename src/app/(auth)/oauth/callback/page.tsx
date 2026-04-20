"use client";

import useOAuthCallback from "@/features/auth/hooks/useOAuthCallback";

export default function OAuthCallbackPage() {
  useOAuthCallback();

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="px-10 py-8 rounded-[20px] glass-card bg-neutral-500/5 flex flex-col items-center gap-4">
        <div className="text-text-main text-2xl font-bold font-Plus_Jakarta_Sans">
          Logowanie przez Google…
        </div>
        <div className="text-text-neutral text-base font-semibold font-Plus_Jakarta_Sans">
          Za chwilę przekierujemy Cię dalej.
        </div>
      </div>
    </div>
  );
}
