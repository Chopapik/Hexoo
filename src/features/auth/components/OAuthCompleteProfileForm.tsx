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

export default function OAuthCompleteProfileForm() {
  const {
    register,
    handleSubmit,
    errors,
    handleServerErrors,
    watchedName,
  } = useOAuthCompleteForm();

  const { handleComplete, isLoading } = useOAuthComplete(handleServerErrors);

  const {
    isChecking: isCheckingUsername,
    isAvailable: isUsernameAvailable,
    error: usernameError,
  } = useCheckUsername(watchedName || "");

  const nameMessages = useMemo((): Message[] => {
    const validationMessages = parseRegisterErrorMessages(errors.name?.message);
    if (validationMessages.length > 0) return validationMessages;

    if (usernameError === "CONFLICT") {
      return [{ type: "Dismiss", text: "Ta nazwa użytkownika jest już zajęta" }];
    }

    if (
      isUsernameAvailable === true &&
      watchedName &&
      watchedName.trim().length >= 3 &&
      !isCheckingUsername
    ) {
      return [{ type: "Success", text: "Nazwa użytkownika jest dostępna" }];
    }

    return [];
  }, [
    errors.name?.message,
    usernameError,
    isUsernameAvailable,
    watchedName,
    isCheckingUsername,
  ]);

  const onSubmit = async (data: OAuthCompleteData) => {
    await handleComplete(data);
  };

  return (
    <div className="w-2xl px-32 py-20 rounded-[20px] inline-flex flex-col justify-center items-center gap-10 overflow-hidden glass-card bg-neutral-500/5">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-text-main text-5xl font-bold font-Plus_Jakarta_Sans">
          Ustaw nazwę
        </div>
        <div className="justify-start text-text-neutral text-2xl font-bold font-Plus_Jakarta_Sans text-center">
          Dokończ rejestrację, aby korzystać z Hexoo.
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="self-stretch flex flex-col justify-center items-center gap-2 overflow-hidden"
      >
        <TextInput
          label="Nazwa użytkownika"
          placeholder="podaj nazwę"
          {...register("name")}
          messages={nameMessages}
        />

        <div className="inline-flex flex-col justify-start items-start overflow-hidden h-8 min-w-1">
          {errors.root && (
            <div className="min-w-48 px-3 h-full bg-red-600 rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] inline-flex justify-center items-center gap-2 overflow-hidden">
              <Image src={warningIconUrl} alt="warning!" />
              <div className="justify-start text-white text-xs font-semibold font-Plus_Jakarta_Sans">
                {parseRegisterErrorMessages(errors.root?.message)[0]?.text}
              </div>
            </div>
          )}
        </div>

        <div className="self-stretch flex flex-col justify-center items-end gap-1 mt-4">
          <Button
            text="Dokończ rejestrację"
            size="xl"
            rightIconUrl={keyIconUrl}
            type="submit"
            isLoading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
