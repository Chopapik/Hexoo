"use client";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import keyIconUrl from "@/assets/icons/key.svg";
import warningIconUrl from "@/assets/icons/warning.svg";
import Image from "next/image";
import useRegister from "./useRegister";

export default function RegisterForm() {
  const { registerData, updateField, handleRegister, isLoading, errors } =
    useRegister();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister();
  };

  return (
    <div className="w-[653px] px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Rejestracja
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
          Załóż konto
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="self-stretch flex flex-col justify-center items-center gap-3 overflow-hidden"
      >
        <TextInput
          label="Nazwa użytkownika"
          placeholder="podaj nową nazwę"
          value={registerData.userName}
          onChange={(e) => updateField("userName", e.target.value)}
          messages={errors.userName}
        />

        <TextInput
          label="Email"
          placeholder="podaj email"
          type="email"
          value={registerData.email}
          onChange={(e) => updateField("email", e.target.value)}
          messages={errors.email}
        />

        <TextInput
          label="Hasło"
          type="password"
          placeholder="podaj hasło"
          value={registerData.password}
          onChange={(e) => updateField("password", e.target.value)}
          messages={errors.password}
        />

        <div className="h-8">
          {errors.root && (
            <div className="min-w-48 px-4 py-2 bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
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
            text={isLoading ? "Rejestracja..." : "Zarejestruj się"}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
