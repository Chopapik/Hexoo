"use client";

import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import Link from "next/link";

import useRegister from "../hooks/useRegister";
import { RegisterData } from "../types/auth.type";
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
        <div className="self-stretch w-full items-center flex flex-col">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register("terms")}
                className="peer appearance-none w-5 h-5 border-2 border-secondary-neutral-stroke-default rounded bg-secondary-neutral-background-default/50 checked:bg-white checked:border-white transition-all duration-200"
              />
              <svg
                className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="inline-flex items-center gap-1 text-text-main text-sm font-medium font-Plus_Jakarta_Sans">
              <span>Akceptuję</span>
              <span>
                <Link
                  href="/terms"
                  className="underline hover:text-white transition-colors"
                >
                  regulamin
                </Link>
              </span>
              <span>serwisu</span>
            </span>
          </label>

          {errors.terms && (
            <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
              <div className="text-red-500">
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-red-500 text-xs font-normal font-Roboto">
                {parseRegisterErrorMessages(errors.terms.message)[0]?.text}
              </span>
            </div>
          )}
        </div>

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
            text="Zarejestruj się"
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
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
