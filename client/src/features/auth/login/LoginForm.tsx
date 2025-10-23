"use client";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import keyIconUrl from "@/assets/icons/key.svg?url";
import Link from "next/link";
import googleIconUrl from "@/assets/icons/google.svg?url";

export default function LoginForm() {
  return (
    <>
      {/* Login Form Container */}
      <div className="px-8 w-full sm:px-32 py-20 xs:rounded-3xl glass-card inline-flex flex-col justify-center items-center gap-10 overflow-hidden ">
        <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden ">
          <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans ">
            Logowanie
          </div>
          <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
            Zaloguj się na swoje konto
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-center items-center overflow-hidden">
          <TextInput label="Login" />
          <TextInput label="Hasło" type="password" />

          {/* Forgot Password & Submit */}
          <div className="self-stretch flex flex-col justify-center items-end gap-1 overflow-hidden mt-4">
            <div className="justify-start text-yellow-500 text-sm font-semibold font-Plus_Jakarta_Sans">
              Przypomnij hasło
            </div>
            <Button text="Zaloguj się" size="xl" rightIconUrl={keyIconUrl} />
          </div>
        </div>
        {/* Google Login
        <div className="self-stretch flex flex-col justify-center items-center gap-2.5 overflow-hidden mt-6 glass-card w-full">
          <div className="self-stretch h-11 px-12 py-3 bg-neutral-800/50 rounded-lg shadow-[0px_20px_20px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2">
            <div className="w-4 h-4 bg-text-main" />
            <div className="text-center justify-start text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
              Zaloguj przez Google
            </div>
          </div>
        </div> */}

        <Button
          size="xl"
          variant="glass-card"
          leftIconUrl={googleIconUrl}
          text={"Zaloguj przez Google"}
        />
        <div className="self-stretch text-center justify-start mt-4">
          <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
            Nie masz konta?
          </span>
          <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans underline">
            <Link href="/register"> Zarejestruj się</Link>
          </span>
        </div>
      </div>
    </>
  );
}
