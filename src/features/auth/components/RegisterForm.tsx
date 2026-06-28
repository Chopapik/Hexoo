"use client";

import { useMemo } from "react";
import Button from "@/features/shared/components/ui/Button";
import Checkbox from "@/features/shared/components/ui/Checkbox";
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
    watchedPassword,
  } = useRegisterForm();

  const { handleRegister, isLoading } = useRegister(handleServerErrors);
  const {
    isChecking: isCheckingUsername,
    isAvailable: isUsernameAvailable,
    error: usernameError,
  } = useCheckUsername(watchedName || "");

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

    return [];
  }, [errors.email?.message, lang]);

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

  const termsErrorMessage = errors.terms
    ? parseRegisterErrorMessages(errors.terms.message, lang)[0]?.text
    : undefined;

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

        <Checkbox {...register("terms")} error={termsErrorMessage}>
          <span>{t("auth.register.accept")}</span>
          <Link
            href="/terms"
            className="underline transition-colors hover:text-foreground-primary-default"
          >
            {t("auth.register.terms")}
          </Link>
          <span>{t("auth.register.service")}</span>
        </Checkbox>

        <div className="inline-flex h-8 min-w-1 flex-col items-start justify-start overflow-hidden">
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
