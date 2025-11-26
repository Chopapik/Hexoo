"use client";

import { useEffect, useState } from "react";
import { BsSpeedometer2 } from "react-icons/bs";

export type ThrottleData = {
  ip: string;
  retryAfter: number;
  limit: number;
};

export default function ThrottleBlockDisplay({ data }: { data: ThrottleData }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const targetTime = data.retryAfter;

    const update = () => {
      const now = Date.now();
      const diff = targetTime - now;
      setTimeLeft(diff > 0 ? diff : 0);

      if (diff <= 0) {
        window.location.href = "/";
      }
    };

    const interval = setInterval(update, 100);
    update();

    return () => clearInterval(interval);
  }, [data]);

  const secondsLeft = (timeLeft / 1000).toFixed(1);

  return (
    <div className="w-[480px] p-8 glass-card border border-yellow-500/30 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 rounded-[20px]">
      <div className="flex items-center justify-center mb-5 text-yellow-500">
        <span className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/30">
          <BsSpeedometer2 className="w-8 h-8 text-yellow-400" />
        </span>
      </div>

      <h1 className="text-2xl font-Albert_Sans font-bold text-text-main text-center mb-2">
        Zwolnij trochę! ✋
      </h1>

      <p className="text-base text-text-neutral text-center mb-6 font-Albert_Sans">
        Wysyłasz zbyt wiele zapytań w krótkim czasie. Nasz serwer musi złapać
        oddech.
      </p>

      <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/50 text-center font-Albert_Sans">
        <p className="text-xs font-semibold uppercase text-yellow-400 mb-1">
          Odblokowanie za
        </p>

        <div className="text-4xl font-extrabold text-yellow-200 font-mono">
          {secondsLeft} s
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => (window.location.href = "/")}
          disabled={timeLeft > 0}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {timeLeft > 0 ? "Czekaj..." : "Odśwież stronę"}
        </button>
      </div>
    </div>
  );
}
