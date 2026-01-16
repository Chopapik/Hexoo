"use client";

import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import Link from "next/link";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import { useLoginForm } from "../hooks/useLoginForm";
import useLogin from "../hooks/useLogin";
import { LoginData } from "../types/auth.type";
import { parseErrorMessages } from "../utils/loginFormValidation";
import { AuthBlockData } from "@/features/shared/components/security/AuthBlockDisplay";
import { BsShieldLockFill } from "react-icons/bs";

export default function LoginForm() {
  const { register, handleSubmit, errors, handleServerErrors } = useLoginForm();
  const [lockoutData, setLockoutData] = useState<AuthBlockData | null>(null);

  const handleLoginError = (code: string, field?: string, data?: any) => {
    if (code === "SECURITY_LOCKOUT" && data) {
      setLockoutData(data);
    } else {
      handleServerErrors(code, field);
    }
  };

  const { handleLogin, isLoading } = useLogin(handleLoginError);

  const onSubmit = async (data: LoginData) => {
    await handleLogin(data);
  };

  const getUnlockTime = () => {
    if (!lockoutData) return "";
    const lockoutTimestamp = lockoutData.lockoutUntil._seconds * 1000;
    return new Date(lockoutTimestamp).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="w-2xl px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Logowanie
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
          Zaloguj się na swoje konto
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="self-stretch flex flex-col justify-center items-center gap-2 overflow-hidden"
      >
        <TextInput
          label="Email"
          placeholder="example@hexoo.com"
          {...register("email")}
          messages={parseErrorMessages(errors.email?.message)}
        />
        <TextInput
          label="Hasło"
          type="password"
          placeholder="•••••••••"
          {...register("password")}
          messages={parseErrorMessages(errors.password?.message)}
        />
        <div className="inline-flex flex-col justify-start items-start overflow-hidden h-8 min-w-1">
          {errors.root && !lockoutData && (
            <div className="min-w-48 px-3 h-full bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-Plus_Jakarta_Sans">
                {parseErrorMessages(errors.root?.message)[0]?.text}
              </div>
            </div>
          )}
        </div>

        {lockoutData ? (
          <div className="self-stretch flex flex-col items-center justify-center gap-3 mt-4 p-4 rounded-xl bg-red-500/5   animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 text-red-500">
              <BsShieldLockFill className="w-5 h-5" />
              <span className="font-bold font-Plus_Jakarta_Sans text-lg">
                Blokada tymczasowa
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-neutral font-Albert_Sans">
                Wykryliśmy zbyt wiele prób logowania.
              </p>
              <p className="text-sm text-text-neutral font-Albert_Sans mt-1">
                Możesz spróbować ponownie o:{" "}
                <span className="font-mono font-bold text-red-400 text-base ml-1">
                  {getUnlockTime()}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
            <Button
              text="Zaloguj się"
              size="xl"
              rightIconUrl={keyIconUrl}
              type="submit"
              isLoading={isLoading}
            />
          </div>
        )}
      </form>

      {!lockoutData && (
        <div className="self-stretch text-center justify-start mt-4">
          <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
            Nie masz konta?
          </span>
          <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans underline ml-1">
            <Link href="/register">Zarejestruj się</Link>
          </span>
        </div>
      )}
    </div>
  );
}
