"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { supabaseClient } from "@/lib/supabaseClient";
import Button from "@/features/shared/components/ui/Button";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email") ?? "";
    setEmail(emailFromUrl);
  }, []);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Wpisz email, żeby wysłać link ponownie.");
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

      toast.success("Wysłaliśmy link aktywacyjny ponownie.");
    } catch (error) {
      console.error("Resend confirmation error:", error);
      toast.error("Nie udało się wysłać maila ponownie.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="px-10 py-8 rounded-[20px] glass-card bg-neutral-500/5 flex flex-col items-center gap-4 text-center w-full max-w-md">
        <div className="text-text-main text-2xl font-bold font-Plus_Jakarta_Sans">
          Sprawdź swoją skrzynkę
        </div>

        <div className="text-text-neutral text-base font-semibold font-Plus_Jakarta_Sans">
          Wysłaliśmy link aktywacyjny na Twój adres email. Kliknij go, żeby
          potwierdzić konto i dokończyć rejestrację.
        </div>

        <span className="mt-4 w-full px-4 py-3 text-2xl outline-none break-all text-text-main font-bold">
          {email}
        </span>

        <Button
          text="Wyślij ponownie"
          onClick={handleResend}
          isLoading={isResending}
        />

        <Link
          href="/login"
          className="mt-2 text-sm underline text-text-neutral"
        >
          Wróć do logowania
        </Link>
      </div>
    </div>
  );
}
