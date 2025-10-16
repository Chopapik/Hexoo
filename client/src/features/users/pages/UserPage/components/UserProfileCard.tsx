import type { UserProfile } from "@/features/users/types/user-profile.type";
import dayjs from "dayjs";

const formatJoinDate = (joinDate: Date) => dayjs(joinDate).format("MMMM YYYY");

const formatLastOnlineDate = (date: Date) =>
  dayjs(date).format("DD.MM.YYYY HH:mm");

export const UserProfileCard = ({
  username,
  avatarUrl,
  joinedAt,
  lastOnline,
  postsCount,
}: UserProfile) => {
  const status = "offline";

  return (
    <div
      data-type="Default"
      className="self-stretch w-full p-4 md:px-6 md:py-5 bg-primary-neutral-background-default rounded-[10px] border-t border-primary-neutral-stroke-default inline-flex flex-col md:flex-row justify-start items-center gap-3"
    >
      <img
        className="w-16 h-16 xs:w-24 xs:h-24 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-secondary-neutral-background-default object-cover"
        src={avatarUrl}
        alt={`${username}'s avatar`}
      />

      <div className="flex-1 w-full max-w-[460px] inline-flex flex-col md:justify-center items-start gap-1 overflow-hidden">
        <div className="justify-center md:justify-start text-center md:text-left w-full text-text-main text-base xs:text-2xl font-bold font-['Roboto'] truncate">
          {username}
        </div>

        {/* Info bar */}
        <div className="self-stretch px-5 py-3.5 bg-[radial-gradient(ellipse_113.20%_442.25%_at_26.12%_10.28%,_var(--text-main,_rgba(255,_255,_255,_0.04))_0%,_var(--text-neutral,_rgba(115,_115,_115,_0.04))_100%)] rounded-xl inline-flex flex-col md:flex-row justify-center md:justify-between items-center gap-5 md:gap-4 overflow-hidden">
          <div className="w-full md:w-auto inline-flex justify-center md:justify-start items-center gap-3 md:gap-4">
            <div className="inline-flex flex-col justify-start items-start gap-0.5">
              <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-['Roboto']">
                dołączył
              </div>
              <div className="self-stretch h-3.5 justify-start text-text-main text-xs font-normal font-['Roboto']">
                {formatJoinDate(joinedAt)}
              </div>
            </div>

            <span className="w-px h-[20px] bg-neutral-500 inline-block" />

            <div className="inline-flex flex-col justify-start items-start gap-0.5">
              <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-['Roboto']">
                ostatnio online
              </div>
              <div className="self-stretch h-3.5 justify-start text-text-main text-xs font-normal font-['Roboto']">
                {formatLastOnlineDate(lastOnline)}
              </div>
            </div>

            <span className="hidden xs:inline-block w-px h-[20px] bg-neutral-500" />

            <div className="hidden xs:inline-flex w-24 flex-col justify-start items-start gap-0.5">
              <div className="self-stretch justify-start text-text-neutral text-xs font-bold font-['Roboto']">
                liczba postów
              </div>
              <div className="self-stretch justify-start text-text-main text-xs font-normal font-['Roboto']">
                {postsCount}
              </div>
            </div>
          </div>

          <div
            data-status={status}
            className="h-8 flex justify-center items-center overflow-hidden md:ml-auto"
          >
            <div className="justify-start text-text-neutral text-lg font-medium font-['Roboto'] italic">
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
