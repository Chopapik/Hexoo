"use client";

import { useMemo } from "react";
import Button from "@/features/shared/components/ui/Button";
import TextInput from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";
import Image from "next/image";
import Link from "next/link";
import { Message } from "@/features/shared/components/ui/TextInput";

import useRegister from "../hooks/useRegister";
import { RegisterData } from "../types/auth.type";
import { parseRegisterErrorMessages } from "../utils/registerErrorMap";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useCheckUsername } from "../hooks/useCheckUsername";
import { useCheckEmail } from "../hooks/useCheckEmail";
import { useI18n } from "@/i18n/useI18n";
import AuthFormCard from "./AuthFormCard";

export default function RegisterForm() {
  const { lang, t } = useI18n();
  const {
    register,
    handleSubmit,
    errors,
    handleServerErrors,
    watchedName,
    watchedEmail,
    watchedPassword,
  } = useRegisterForm();

  const { handleRegister, isLoading } = useRegister(handleServerErrors);
  const {
    isChecking: isCheckingUsername,
    isAvailable: isUsernameAvailable,
    error: usernameError,
  } = useCheckUsername(watchedName || "");
  const {
    isChecking: isCheckingEmail,
    isAvailable: isEmailAvailable,
    error: emailError,
  } = useCheckEmail(watchedEmail || "");

  const nameMessages = useMemo((): Message[] => {
    const validationMessages = parseRegisterErrorMessages(
      errors.name?.message,
      lang,
    );

    if (validationMessages.length > 0) {
      return validationMessages;
    }

    if (usernameError === "CONFLICT") {
      return [
        {
          type: "Dismiss",
          text: t("auth.usernameTaken"),
        },
      ];
    }

    if (
      isUsernameAvailable === true &&
      watchedName &&
      watchedName.trim().length >= 3 &&
      !isCheckingUsername
    ) {
      return [
        {
          type: "Success",
          text: t("auth.usernameAvailable"),
        },
      ];
    }

    return [];
  }, [
    errors.name?.message,
    lang,
    t,
    usernameError,
    isUsernameAvailable,
    watchedName,
    isCheckingUsername,
  ]);

  const emailMessages = useMemo((): Message[] => {
    const validationMessages = parseRegisterErrorMessages(
      errors.email?.message,
      lang,
    );

    if (validationMessages.length > 0) {
      return validationMessages;
    }

    if (emailError === "CONFLICT") {
      return [
        {
          type: "Dismiss",
          text: t("auth.emailTaken"),
        },
      ];
    }

    if (
      isEmailAvailable === true &&
      watchedEmail &&
      watchedEmail.trim().length > 0 &&
      !isCheckingEmail
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(watchedEmail.trim())) {
        return [
          {
            type: "Success",
            text: t("auth.emailAvailable"),
          },
        ];
      }
    }

    return [];
  }, [
    errors.email?.message,
    lang,
    t,
    emailError,
    isEmailAvailable,
    watchedEmail,
    isCheckingEmail,
  ]);

  const passwordMessages = useMemo((): Message[] => {
    const validationMessages = parseRegisterErrorMessages(
      errors.password?.message,
      lang,
    );

    if (validationMessages.length > 0) {
      return validationMessages;
    }

    if (watchedPassword && watchedPassword.length >= 8) {
      return [
        {
          type: "Success",
          text: t("auth.passwordValid"),
        },
      ];
    }

    return [];
  }, [errors.password?.message, lang, t, watchedPassword]);

  const onSubmit = async (data: RegisterData) => {
    await handleRegister(data);
  };

  return (
    <AuthFormCard
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footerText={t("auth.register.haveAccount")}
      footerLinkHref="/login"
      footerLinkText={t("auth.login.submit")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="self-stretch flex flex-col justify-center items-center gap-2 sm:gap-3 overflow-hidden"
      >
        <TextInput
          label={t("auth.register.username")}
          placeholder={t("auth.register.namePlaceholder")}
          {...register("name")}
          messages={nameMessages}
        />

        <TextInput
          label="Email"
          placeholder={t("auth.register.emailPlaceholder")}
          type="email"
          {...register("email")}
          messages={emailMessages}
        />

        <TextInput
          label={t("auth.register.password")}
          type="password"
          placeholder={t("auth.register.passwordPlaceholder")}
          {...register("password")}
          messages={passwordMessages}
        />
        <div className="self-stretch w-full items-center flex flex-col">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register("terms")}
                className="peer appearance-none w-5 h-5 border-2 border-divider-default rounded bg-surface-chrome-background-default/50 checked:bg-white checked:border-white transition-all duration-200"
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
            <span className="inline-flex items-center gap-1 text-foreground-primary-default text-xs sm:text-sm font-medium font-sans">
              <span>{t("auth.register.accept")}</span>
              <span>
                <Link
                  href="/terms"
                  className="underline hover:text-white transition-colors"
                >
                  {t("auth.register.terms")}
                </Link>
              </span>
              <span>{t("auth.register.service")}</span>
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
              <span className="text-red-500 text-xs font-normal font-sans">
                {parseRegisterErrorMessages(errors.terms.message, lang)[0]?.text}
              </span>
            </div>
          )}
        </div>

        <div className="h-8 min-w-1 inline-flex flex-col justify-start items-start overflow-hidden">
          {errors.root && (
            <div className="min-w-48 px-4 py-2 bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-sans">
                {parseRegisterErrorMessages(errors.root?.message, lang)[0]?.text}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-3 sm:mt-4">
          <Button
            text={t("auth.register.submit")}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
          />
        </div>
      </form>

    </AuthFormCard>
  );
}
