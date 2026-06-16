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
        className="flex self-stretch flex-col items-center justify-center gap-[18px] overflow-hidden"
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
                className="peer size-5 appearance-none rounded border-2 border-checkbox-border-unchecked-default bg-checkbox-background-unchecked-default transition-all duration-200 checked:border-checkbox-border-checked-default checked:bg-checkbox-background-checked-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default focus-visible:ring-offset-2 focus-visible:ring-offset-page-background-default disabled:border-checkbox-border-unchecked-disabled disabled:bg-checkbox-background-unchecked-disabled checked:disabled:border-checkbox-border-checked-disabled checked:disabled:bg-checkbox-background-checked-disabled"
              />
              <svg
                className="pointer-events-none absolute h-3.5 w-3.5 text-checkbox-icon-default opacity-0 transition-opacity peer-checked:opacity-100 peer-disabled:text-checkbox-icon-disabled"
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
            <span className="inline-flex items-center gap-1 font-sans text-xs font-medium text-checkbox-label-default group-has-[:disabled]:text-checkbox-label-disabled md:text-sm">
              <span>{t("auth.register.accept")}</span>
              <span>
                <Link
                  href="/terms"
                  className="underline transition-colors hover:text-foreground-primary-default"
                >
                  {t("auth.register.terms")}
                </Link>
              </span>
              <span>{t("auth.register.service")}</span>
            </span>
          </label>

          {errors.terms && (
            <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
              <div className="text-validation-error-icon">
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M13 1.30929L11.6907 0L6.5 5.19071L1.30929 0L0 1.30929L5.19071 6.5L0 11.6907L1.30929 13L6.5 7.80929L11.6907 13L13 11.6907L7.80929 6.5L13 1.30929Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-sans text-xs font-normal text-validation-error-text">
                {
                  parseRegisterErrorMessages(errors.terms.message, lang)[0]
                    ?.text
                }
              </span>
            </div>
          )}
        </div>

        <div className="h-8 min-w-1 inline-flex flex-col justify-start items-start overflow-hidden">
          {errors.root && (
            <div className="inline-flex min-w-48 items-center justify-center gap-2 overflow-hidden rounded-lg bg-validation-error-background px-4 py-2">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start font-sans text-xs font-semibold text-button-text-default">
                {
                  parseRegisterErrorMessages(errors.root?.message, lang)[0]
                    ?.text
                }
              </div>
            </div>
          )}
        </div>

        <div className="flex self-stretch flex-col items-end justify-center">
          <Button
            text={t("auth.register.submit")}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
            className="w-full"
          />
        </div>
      </form>
    </AuthFormCard>
  );
}
