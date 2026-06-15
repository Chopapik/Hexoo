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
  const showLastOnline = isOnline || !!lastOnline;
  const statusLabel = isOnline ? "Online" : "Offline";

  return (
    <>
      {showEditProfileModal && (
        <EditProfileModal
          user={userProfileData}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

      <div className="relative inline-flex w-full self-stretch flex-col items-center justify-start gap-3 rounded-xl border border-surface-card-border-default bg-surface-card-background-default p-3 shadow-lg sm:p-4 md:flex-row md:px-6 md:py-5">
        <div className="h-14 w-14 rounded-xl bg-surface-card-border-default p-px shadow-lg xs:h-20 xs:w-20 md:h-24 md:w-24">
          <Image
            className="w-full h-full rounded-xl object-cover"
            src={avatarUrl ?? defaultAvatarUrl}
            alt={`${name}'s avatar`}
            width={96}
            height={96}
          />
        </div>
        {enableEditProfile && (
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4 md:right-7">
            <Button
              text={t("profile.edit")}
              size="sm"
              onClick={() => setShowEditProfileModal(true)}
            />
          </div>
        )}

        <div className="flex-1 w-full inline-flex flex-col md:justify-center items-start gap-2 overflow-hidden">
          <div className="flex flex-row px-1 justify-center md:justify-between items-center text-center md:text-left w-full text-foreground-primary-default text-base xs:text-xl md:text-2xl font-bold font-sans truncate">
            <span className="md:ml-1">{name}</span>
          </div>

          {/* Info bar */}
          <div className="inline-flex self-stretch flex-row items-center justify-between gap-2 overflow-hidden rounded-xl bg-surface-chrome-background-default/25 px-3 py-2 sm:gap-3 sm:px-5 sm:py-3.5">
            <div className="w-auto inline-flex justify-start items-center gap-2 sm:gap-3 md:gap-4">
              <div className="inline-flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch h-3.5 justify-start text-foreground-secondary-default text-xs font-bold font-sans">
                  {t("profile.joined")}
                </div>
                <div className="self-stretch h-3.5 justify-start text-foreground-primary-default text-xs font-normal font-sans">
                  {formatDate(createdAt, "MMMM YYYY", lang)}
                </div>
              </div>

              {showLastOnline && (
                <>
                  <span className="w-px h-5 bg-divider-default inline-block" />
                  <div className="inline-flex flex-col justify-start items-start gap-0.5">
                    <div className="self-stretch h-3.5 justify-start text-foreground-secondary-default text-xs font-bold font-sans">
                      {t("profile.lastOnline")}
                    </div>
                    <div className="h-3.5 self-stretch justify-start font-sans text-xs font-normal text-foreground-primary-default">
                      {isOnline
                        ? t("profile.now")
                        : formatSmartDate(lastOnline, lang)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-7 sm:h-8 flex justify-center items-center font-serif font-light text-lg sm:text-xl mr-1 overflow-hidden md:ml-auto">
              <div
                className={
                  isOnline
                    ? "text-green-500"
                    : "italic text-foreground-secondary-default"
                }
              >
                {statusLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
