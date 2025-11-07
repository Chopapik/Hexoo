"use client";

import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import Link from "next/link";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
  const { loginData, updateField, handleLogin, errors, isLoading } = useLogin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="w-[653px] px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Logowanie
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
          Zaloguj się na swoje konto
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="self-stretch flex flex-col justify-center items-center gap-2 overflow-hidden"
      >
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={loginData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="example@hexoo.com"
          messages={errors.email}
        />
        <TextInput
          label="Hasło"
          name="password"
          type="password"
          value={loginData.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="•••••••••"
          messages={errors.password}
        />

        <div className="inline-flex flex-col justify-start items-start overflow-hidden h-8 min-w-1">
          {errors.root && (
            <div className="min-w-48 px-3 h-full bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-Plus_Jakarta_Sans">
                {errors.root}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
          <Button
            onClick={onSubmit}
            text={isLoading ? "Logowanie..." : "Zaloguj się"}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>

      <div className="self-stretch text-center justify-start mt-4">
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
          Nie masz konta?
        </span>
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans underline ml-1">
          <Link href="/register">Zarejestruj się</Link>
        </span>
      </div>
    </div>
  );
}
