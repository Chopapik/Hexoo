"use client";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import keyIconUrl from "@/assets/icons/key.svg";
import appleIconUrl from "@/assets/icons/apple.svg";
import googleIconUrl from "@/assets/icons/google.svg";
import waringIconUrl from "@/assets/icons/warning.svg";
import Link from "next/link";
import useLogin from "./useLogin";

export default function LoginForm() {
  const { handleChange, handleLogin, error } = useLogin();

  return (
    <div className="w-[653px] px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      {/* Nagłówki */}
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Logowanie
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
          Zaloguj się na swoje konto
        </div>
      </div>

      <div className="self-stretch flex flex-col justify-center items-center gap-2 overflow-hidden">
        <TextInput
          label="Email"
          name="email"
          type="email"
          onChange={handleChange}
          placeholder="example@hexoo.com"
        />
        <TextInput
          label="Hasło"
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="•••••••••"
        />

        <div className="inline-flex flex-col justify-start items-start overflow-hidden h-8 min-w-1">
          {error && (
            <div className="min-w-48 px-3 h-full bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <div className="w-3.5 h-3.5 bg-white" />
              <div className="justify-start text-white text-xs font-semibold font-Plus_Jakarta_Sans">
                {error}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
          <div className="justify-start text-yellow-500 text-sm font-semibold font-Plus_Jakarta_Sans">
            Przypomnij hasło
          </div>
          <Button
            text="Zaloguj się"
            size="xl"
            rightIconUrl={keyIconUrl}
            onClick={handleLogin}
          />
        </div>
      </div>
      <div className="self-stretch text-center justify-start mt-4">
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
          Nie masz konta?
        </span>
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans underline">
          <Link href="/register"> Zarejestruj się</Link>
        </span>
      </div>
      <div className="self-stretch h-40 flex flex-col justify-center items-center gap-2.5 overflow-hidden">
        <Button
          size="xl"
          variant="glass-card"
          leftIconUrl={googleIconUrl}
          text="Zaloguj przez Google"
          className="bg-neutral-500/15"
        />
        <Button
          size="xl"
          variant="glass-card"
          leftIconUrl={appleIconUrl}
          text="Zaloguj przez Apple"
          leftIconClassName="relative bottom-0.5"
          className="bg-neutral-500/15"
        />
      </div>
    </div>
  );
}
