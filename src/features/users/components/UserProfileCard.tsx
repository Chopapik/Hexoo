"use client";

import Image from "next/image";
import useProfile from "../hooks/useProfile";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import EditProfileModal from "../../me/components/EditProfileModal";
import "dayjs/locale/pl";
import { formatDate, formatSmartDate } from "@/features/shared/utils/dateUtils";
import { UserProfileResponseDto } from "@/features/users/types/user.dto";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

export const UserProfileCard = ({
  username,
  enableEditProfile,
  initialUser,
}: {
  username: string;
  enableEditProfile: boolean;
  initialUser?: UserProfileResponseDto;
}) => {
  const { lang, t } = useI18n();
  const { userProfileData } = useProfile(username, initialUser);

  const [showEditProfileModal, setShowEditProfileModal] =
    useState<boolean>(false);

  const isOnline = useAppStore((s) =>
    userProfileData?.uid
      ? s.presence.onlineUids.has(userProfileData.uid)
      : false,
  );

  if (!userProfileData) {
    return null;
  }

  const { avatarUrl, name, createdAt, lastOnline } = userProfileData;
  const statusLabel = isOnline ? "Online" : "Offline";
  const lastOnlineLabel = isOnline
    ? t("profile.now")
    : formatSmartDate(lastOnline, lang) || "—";

  return (
    <>
      {showEditProfileModal && (
        <EditProfileModal
          user={userProfileData}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

      <div className="relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-xl border-t-2 border-solid border-surface-card-border-default bg-surface-card-background-default p-3 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.25)] sm:p-4 md:h-[136px] md:flex-row md:px-6 md:py-5">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-card-border-default shadow-[0px_8px_24px_0px_rgba(0,0,0,0.25)] xs:size-20 md:size-24">
          <Image
            className="h-full w-full object-cover"
            src={avatarUrl ?? defaultAvatarUrl}
            alt={`${name}'s avatar`}
            width={96}
            height={96}
          />
        </div>
        {enableEditProfile && (
          <div className="absolute right-6 top-4">
            <Button
              text={t("profile.edit")}
              size="sm"
              onClick={() => setShowEditProfileModal(true)}
            />
          </div>
        )}

        <div className="flex h-[84px] w-full shrink-0 flex-col items-start gap-2 overflow-hidden sm:h-[92px] md:h-[92px] md:min-w-0 md:flex-1 md:justify-center">
          <div className="flex h-6 w-full shrink-0 items-center justify-center overflow-hidden px-1 text-center text-foreground-primary-default sm:h-7 md:h-8 md:justify-start md:text-left">
            <span className="truncate font-sans text-base font-bold leading-[1.2] xs:text-xl md:text-2xl">
              {name}
            </span>
          </div>

          <div className="flex h-11 w-full shrink-0 flex-row items-center justify-between overflow-hidden rounded-xl bg-[#262626]/18 px-3 py-2 sm:h-[58px] sm:px-5 sm:py-3.5">
            <div className="flex h-7 shrink-0 items-center gap-2 overflow-hidden sm:gap-3 md:gap-4">
              <div className="flex h-[30px] shrink-0 flex-col items-start gap-0.5 overflow-hidden whitespace-nowrap text-xs leading-none">
                <div className="shrink-0 font-sans font-bold text-foreground-secondary-default">
                  {t("profile.joined")}
                </div>
                <div className="shrink-0 font-sans font-normal text-foreground-primary-default">
                  {formatDate(createdAt, "MMMM YYYY", lang)}
                </div>
              </div>

              <span className="inline-block h-5 w-px shrink-0 bg-surface-card-border-default" />

              <div className="flex h-[30px] shrink-0 flex-col items-start gap-0.5 overflow-hidden whitespace-nowrap text-xs leading-none">
                <div className="shrink-0 font-sans font-bold text-foreground-secondary-default">
                  {t("profile.lastOnline")}
                </div>
                <div className="shrink-0 font-sans font-normal text-foreground-primary-default">
                  {lastOnlineLabel}
                </div>
              </div>
            </div>

            <div className="flex h-[18px] w-[50px] shrink-0 items-center justify-center overflow-hidden sm:h-5 sm:w-14 md:ml-auto">
              <p
                className={
                  "[word-break:break-word] size-full whitespace-nowrap font-serif text-[18px] font-light leading-none sm:text-xl " +
                  (isOnline
                    ? "text-green-500"
                    : "text-foreground-secondary-default")
                }
              >
                {statusLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
