"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AuthBlockDisplay, {
  AuthBlockData,
} from "@/features/shared/components/security/AuthBlockDisplay";
import ThrottleBlockDisplay, {
  ThrottleData,
} from "@/features/shared/components/security/ThrottleBlockDisplay";

export default function CriticalErrorPage() {
  const searchParams = useSearchParams();
  const rawDetails = searchParams.get("details");
  const status = searchParams.get("status");

  const errorData = useMemo(() => {
    if (!rawDetails) return null;
    try {
      return JSON.parse(decodeURIComponent(rawDetails));
    } catch (e) {
      return null;
    }
  }, [rawDetails]);

  if (!errorData) {
    return (
      <div className="pt-10 text-white text-center">
        Wystąpił nieznany błąd.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center ">
      {status === "RATE_LIMIT" && errorData.lockoutUntil && (
        <AuthBlockDisplay data={errorData as AuthBlockData} />
      )}

      {status === "RATE_LIMIT" && errorData.retryAfter && (
        <ThrottleBlockDisplay data={errorData as ThrottleData} />
      )}

      {status !== "RATE_LIMIT" && (
        <div className="text-red-500 glass-card p-8 rounded-xl">
          Nieznany błąd krytyczny: {status}
        </div>
      )}
    </div>
  );
}
