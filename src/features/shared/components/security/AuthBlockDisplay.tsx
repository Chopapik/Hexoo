"use client";

import { useEffect, useState } from "react";
import { BsShieldLockFill } from "react-icons/bs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";

dayjs.extend(relativeTime);
dayjs.locale("pl");

/** Login lockout data (Brute-force protection) */
export type AuthBlockData = {
  ipBlocked: boolean;
  maxAnonymousAttempts: number;
  lockoutUntil: {
    _seconds: number;
    _nanoseconds: number;
  };
};

const formatRemainingTime = (milliseconds: number) => {
  if (milliseconds <= 0) return "mniej niż 1 sekunda";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (minutes > 0) parts.push(`${minutes} minut`);
  if (seconds > 0) parts.push(`${seconds} sekund`);
  return parts.length > 0 ? parts.join(" i ") : "mniej niż 1 sekunda";
};

export default function AuthBlockDisplay({ data }: { data: AuthBlockData }) {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    // Konwersja Firebase Timestamp na ms
    const lockoutTimestamp = data.lockoutUntil._seconds * 1000;

    const updateTime = () => {
      const now = Date.now();
      const diff = lockoutTimestamp - now;
      setRemainingTime(diff);
    };

    const interval = setInterval(updateTime, 1000);
    updateTime();

    return () => clearInterval(interval);
  }, [data]);

  if (remainingTime !== null && remainingTime <= 0) {
    window.location.href = "/login";
    return (
      <div className="text-center p-6 text-green-400 bg-white/10 rounded-xl max-w-lg mx-auto font-Albert_Sans">
        Blokada wygasła. Spróbuj zalogować się ponownie.
      </div>
    );
  }

  return (
    <div className="w-[560px] p-8 glass-card border border-primary-neutral-stroke-default shadow-xl backdrop-blur-xl animate-in fade-in duration-300 rounded-[20px]">
      <div className="flex items-center justify-center mb-6 text-red-500">
        <span className="p-3 bg-red-500/10 rounded-full border border-red-500/30">
          <BsShieldLockFill className="w-8 h-8 text-red-400" />
        </span>
      </div>
      <h1 className="text-3xl font-Albert_Sans font-bold text-text-main text-center mb-2">
        Konto Zablokowane
      </h1>
      <p className="text-base text-text-neutral text-center mb-6 font-Albert_Sans">
        Twój adres IP lub konto zostało tymczasowo zablokowane z powodu zbyt
        wielu nieudanych prób logowania.
      </p>
      <div className="bg-red-900/20 p-4 rounded-xl border border-red-700/50 text-center font-Albert_Sans">
        <p className="text-xs font-semibold uppercase text-red-400 mb-1">
          Wymagana przerwa
        </p>
        <div className="text-5xl font-extrabold text-red-300">
          {formatRemainingTime(remainingTime || 0)}
        </div>
        <p className="text-sm text-text-neutral/70 mt-2">
          Limit prób: {data.maxAnonymousAttempts}
        </p>
      </div>
    </div>
  );
}
