import type { UserProfile } from "@/features/users/types/user-profile.type";
import dayjs from "dayjs";

const formatJoinDate = (joinDate: Date) => dayjs(joinDate).format("MMMM YYYY");

const formatLastOnlineDate = (date: Date) =>
  dayjs(date).format("DD.MM.YYYY HH:mm");

export const UserProfileCard = ({
  nickname,
  avatarUrl,
  joinedAt,
  lastOnline,
  postsCount,
}: UserProfile) => {
  return (
    <div className="self-stretch w-full px-8 py-6 bg-primary-neutral-background-default rounded-[10px] border-t-2 border-primary-neutral-stroke-default inline-flex justify-start items-start gap-5">
      <img
        className="w-28 h-28 rounded-[10px] border border-neutral-600"
        src={avatarUrl}
        alt={`${nickname}'s avatar`}
      />
      <div className="inline-flex flex-col justify-start items-start gap-3 overflow-hidden">
        <div className="w-96 h-8 justify-start text-text-main text-3xl font-bold font-['Roboto'] truncate">
          {nickname}
        </div>
        <div className="px-5 py-3.5 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-sm inline-flex justify-center items-center gap-4 overflow-hidden">
          <div className="inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-['Roboto']">
              dołączył
            </div>
            <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-normal font-['Roboto']">
              {formatJoinDate(joinedAt)}
            </div>
          </div>

          <span className="w-px h-[20px] bg-neutral-500 inline-block"></span>

          <div className="inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-bold font-['Roboto']">
              ostatnio online
            </div>
            <div className="self-stretch h-3.5 justify-start text-text-neutral text-xs font-normal font-['Roboto']">
              {formatLastOnlineDate(lastOnline)}
            </div>
          </div>

          <span className="w-px h-[20px] bg-neutral-500 inline-block"></span>

          <div className="w-24 inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch justify-start text-text-neutral text-xs font-bold font-['Roboto']">
              liczba postów
            </div>
            <div className="self-stretch justify-start text-text-neutral text-xs font-normal font-['Roboto']">
              {postsCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
