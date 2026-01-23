"use client";

import Image from "next/image";
import useProfile from "../hooks/useProfile";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import { useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import EditProfileModal from "../../me/components/EditProfileModal";
import "dayjs/locale/pl";
import { formatDate } from "@/features/shared/utils/dateUtils";
import { UserProfile } from "@/features/users/types/user.type";

const status = "Offline";

export const UserProfileCard = ({
  username,
  enableEditProfile,
  initialUser,
}: {
  username: string;
  enableEditProfile: boolean;
  initialUser?: UserProfile;
}) => {
  const { userProfileData } = useProfile(username, initialUser);

  const [showEditProfileModal, setShowEditProfileModal] =
    useState<boolean>(false);

  if (!userProfileData) {
    return null;
  }

  const { avatarUrl, name, createdAt, lastOnline } = userProfileData;

  return (
    <>
      {showEditProfileModal && (
        <EditProfileModal
          user={userProfileData}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

      <div className="self-stretch w-full p-4 md:px-6 md:py-5 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default shadow-lg inline-flex flex-col md:flex-row justify-start items-center gap-3 relative">
        <div className="w-16 h-16 xs:w-24 xs:h-24 rounded-xl p-px bg-[radial-gradient(circle_at_center,#262626_0%,#171717_100%)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <Image
            className="w-full h-full rounded-xl object-cover"
            src={avatarUrl ?? defaultAvatarUrl}
            alt={`${name}'s avatar`}
            width={96}
            height={96}
          />
        </div>
        {enableEditProfile && (
          <div className="absolute top-4 right-4 md:right-7">
            <Button
              text="edytuj profil"
              size="sm"
              onClick={() => setShowEditProfileModal(true)}
            />
          </div>
        )}

        <div className="flex-1 w-full inline-flex flex-col md:justify-center items-start gap-2 overflow-hidden">
          <div className="flex flex-col md:px-1 md:flex-row md:justify-between md:items-center text-center md:text-left w-full text-text-main text-base xs:text-2xl font-bold font-Albert_Sans truncate">
            <span className="ml-1">{name}</span>
          </div>

          {/* Info bar */}
          <div className="self-stretch px-5 py-3.5 bg-[radial-gradient(ellipse_113.20%_442.25%_at_26.12%_10.28%,var(--text-main,rgba(255,255,255,0.04))_0%,var(--text-neutral,rgba(115,115,115,0.04))_100%)] ] rounded-xl inline-flex flex-col md:flex-row justify-center md:justify-between items-center gap-5 md:gap-4 overflow-hidden">
            <div className="w-full md:w-auto inline-flex justify-center md:justify-start items-center gap-3 md:gap-4">
              <div className="inline-flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-Albert_Sans">
                  dołączył
                </div>
                <div className="self-stretch h-3.5 justify-start text-text-main text-xs font-normal font-Albert_Sans">
                  {formatDate(createdAt, "MMMM YYYY")}
                </div>
              </div>

              {lastOnline && (
                <>
                  <span className="w-px h-5 bg-primary-neutral-stroke-default inline-block" />
                  <div className="inline-flex flex-col justify-start items-start gap-0.5">
                    <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-Albert_Sans">
                      ostatnio online
                    </div>
                    <div className="self-stretch h-3.5 justify-start text-text-main text-xs font-normal font-Albert_Sans">
                      {/* last online date here*/}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 flex justify-center items-center overflow-hidden md:ml-auto">
              <div className="justify-start text-text-neutral text-lg font-medium font-Albert_Sans italic mr-1">
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
