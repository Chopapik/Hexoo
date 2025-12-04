"use client";

import { useEffect, useState } from "react";
import { BsHourglassSplit } from "react-icons/bs";

export type ThrottleData = {
  ip: string;
  retryAfter: number;
  limit: number;
};

export default function ThrottleBlockDisplay({ data }: { data: ThrottleData }) {
  const [isLocked, setIsLocked] = useState(true);

  const unlockTime = new Date(data.retryAfter).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  useEffect(() => {
    const checkStatus = () => {
      const now = Date.now();
      if (now >= data.retryAfter) {
        setIsLocked(false);
        window.location.href = "/";
      }
    };
    const interval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => clearInterval(interval);
  }, [data.retryAfter]);

  return (
    <div className="w-full max-w-md p-10 glass-card border border-fuchsia-500/20 shadow-2xl rounded-2xl flex h-fit flex-col items-center">
      {" "}
      <div className="mb-6 p-3 bg-white/5 rounded-full border border-white/10 text-text-neutral">
        <BsHourglassSplit className="w-6 h-6 opacity-80" />
      </div>
      <h1 className="text-xl font-Albert_Sans font-medium text-text-main text-center mb-2">
        Tymczasowe ograniczenie
      </h1>
      <p className="text-sm text-text-neutral text-center mb-8 font-Albert_Sans leading-relaxed">
        Wykryliśmy dużą liczbę zapytań z Twojego urządzenia.
        <br />
        Dostęp do serwisu zostanie przywrócony o godzinie:
      </p>
      <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10 mb-8">
        <span className="text-2xl font-mono font-semibold text-text-main tracking-wider">
          {unlockTime}
        </span>
      </div>
    </div>
  );
}
