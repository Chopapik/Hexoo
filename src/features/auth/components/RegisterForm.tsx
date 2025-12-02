"use client";

import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import Link from "next/link";

import useRegister from "../hooks/useRegister";
import { RegisterData } from "../types/auth.types";
import { parseRegisterErrorMessages } from "../utils/registerFormValidation";
import { useRegisterForm } from "../hooks/useRegisterForm";

export default function RegisterForm() {
  const { register, handleSubmit, errors, handleServerErrors } =
    useRegisterForm();

  const { handleRegister, isLoading } = useRegister(handleServerErrors);

  const onSubmit = async (data: RegisterData) => {
    await handleRegister(data);
  };

  return (
    <div className="w-2xl px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Rejestracja
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans">
          Załóż konto
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="self-stretch flex flex-col justify-center items-center gap-3 overflow-hidden"
      >
        <TextInput
          label="Nazwa użytkownika"
          placeholder="podaj imię"
          {...register("name")}
          messages={parseRegisterErrorMessages(errors.name?.message)}
        />

        <TextInput
          label="Email"
          placeholder="podaj email"
          type="email"
          {...register("email")}
          messages={parseRegisterErrorMessages(errors.email?.message)}
        />

        <TextInput
          label="Hasło"
          type="password"
          placeholder="podaj hasło"
          {...register("password")}
          messages={parseRegisterErrorMessages(errors.password?.message)}
        />

        <div className="h-8 min-w-1 inline-flex flex-col justify-start items-start overflow-hidden">
          {errors.root && (
            <div className="min-w-48 px-4 py-2 bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-Plus_Jakarta_Sans">
                {parseRegisterErrorMessages(errors.root?.message)[0]?.text}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
          <Button
            text={isLoading ? "Rejestracja..." : "Zarejestruj się"}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            disabled={isLoading}
          />
        </div>
      </form>

      <div className="self-stretch text-center justify-start mt-4">
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans">
          Masz już konto?
        </span>
        <span className="text-text-main text-base font-semibold font-Plus_Jakarta_Sans underline ml-1">
          <Link href="/login">Zaloguj się</Link>
        </span>
      </div>
    </div>
  );
}
