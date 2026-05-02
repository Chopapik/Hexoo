"use client";

import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import Link from "next/link";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import { useLoginForm } from "../hooks/useLoginForm";
import useLogin from "../hooks/useLogin";
import useGoogleLogin from "../hooks/useGoogleLogin";
import { LoginData } from "../types/auth.type";
import { parseErrorMessages } from "../utils/loginErrorMap";

export default function LoginForm() {
  const { register, handleSubmit, errors, handleServerErrors } = useLoginForm();

  const { handleLogin, isLoading } = useLogin(handleServerErrors);
  const { handleGoogleLogin, isLoading: isGoogleLoading } = useGoogleLogin();

  const onSubmit = async (data: LoginData) => {
    await handleLogin(data);
  };

  return (
    <div className="w-2xl px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-6xl  font-serif">
          Logowanie
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
          {errors.root && (
            <div className="min-w-48 px-3 h-full bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-sans">
                {parseErrorMessages(errors.root?.message)[0]?.text}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
          <Button
            text="Zaloguj się"
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
          />
        </div>
      </form>

      <div className="self-stretch text-center justify-start mt-4">
        <span className="text-text-main text-base font-semibold font-sans">
          Nie masz konta?
        </span>
        <span className="text-text-main text-base font-semibold font-sans underline ml-1">
          <Link href="/register">Zarejestruj się</Link>
        </span>
      </div>

      <Button
        text="Zaloguj się przez Google"
        size="xl"
        variant="secondary"
        leftIcon={
          [
            <svg
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
              strokeLinejoin="round"
              strokeMiterlimit="2"
              className="size-[18px] shrink-0"
              aria-hidden
            >
              <path
                d="M32.582 370.734C15.127 336.291 5.12 297.425 5.12 256c0-41.426 10.007-80.291 27.462-114.735C74.705 57.484 161.047 0 261.12 0c69.12 0 126.836 25.367 171.287 66.793l-73.31 73.309c-26.763-25.135-60.276-38.168-97.977-38.168-66.56 0-123.113 44.917-143.36 105.426-5.12 15.36-8.146 31.65-8.146 48.64 0 16.989 3.026 33.28 8.146 48.64l-.303.232h.303c20.247 60.51 76.8 105.426 143.36 105.426 34.443 0 63.534-9.31 86.341-24.67 27.23-18.152 45.382-45.148 51.433-77.032H261.12v-99.142h241.105c3.025 16.757 4.654 34.211 4.654 52.364 0 77.963-27.927 143.592-76.334 188.276-42.356 39.098-100.305 61.905-169.425 61.905-100.073 0-186.415-57.483-228.538-141.032v-.233z"
                fill="#fff"
              />
            </svg>
          ]
        }
        type="button"
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
      />
    </div>
  );
}
