"use client";

import { useMemo } from "react";
import Image from "next/image";
import Button from "@/features/shared/components/ui/Button";
import TextInput, { Message } from "@/features/shared/components/ui/TextInput";
import keyIconUrl from "@/features/shared/assets/icons/key.svg?url";
import warningIconUrl from "@/features/shared/assets/icons/warning.svg?url";

import { useOAuthCompleteForm } from "../hooks/useOAuthCompleteForm";
import useOAuthComplete from "../hooks/useOAuthComplete";
import { useCheckUsername } from "../hooks/useCheckUsername";
import { OAuthCompleteData } from "../types/auth.type";
import { parseRegisterErrorMessages } from "../utils/registerErrorMap";
import { useI18n } from "@/i18n/useI18n";

export default function OAuthCompleteProfileForm() {
  const { lang, t } = useI18n();
  const { register, handleSubmit, errors, handleServerErrors, watchedName } =
    useOAuthCompleteForm();

  const { handleComplete, isLoading } = useOAuthComplete(handleServerErrors);

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
    if (validationMessages.length > 0) return validationMessages;

    if (usernameError === "CONFLICT") {
      return [{ type: "Dismiss", text: t("auth.usernameTaken") }];
    }

    if (
      isUsernameAvailable === true &&
      watchedName &&
      watchedName.trim().length >= 3 &&
      !isCheckingUsername
    ) {
      return [{ type: "Success", text: t("auth.usernameAvailable") }];
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

  const onSubmit = async (data: OAuthCompleteData) => {
    await handleComplete(data);
  };

  return (
    <div className="mx-auto inline-flex w-full max-w-md flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 xs:px-6 sm:max-w-2xl sm:gap-10 sm:rounded-[20px] sm:px-12 sm:py-12 sm:glass-card md:px-32 md:py-20 ">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-foreground-primary-default text-4xl sm:text-5xl font-bold font-serif">
          {t("auth.completeProfile.title")}
        </div>
        <div className="justify-start text-foreground-secondary-default text-base  font-bold font-sans text-center">
          {t("auth.completeProfile.subtitle")}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="self-stretch flex flex-col justify-center items-center gap-1.5 sm:gap-2 overflow-hidden"
      >
        <TextInput
          label={t("auth.register.username")}
          placeholder={t("auth.completeProfile.placeholder")}
          {...register("name")}
          messages={nameMessages}
        />

        <div className="inline-flex flex-col justify-start items-start overflow-hidden h-8 min-w-1">
          {errors.root && (
            <div className="inline-flex h-full min-w-48 items-center justify-center gap-2 overflow-hidden rounded-lg bg-validation-error-background px-3">
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

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-3 sm:mt-4 w-full">
          <Button
            text={t("auth.completeProfile.submit")}
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
            className="self-stretch"
          />
        </div>
      </form>
    </div>
  );
}
