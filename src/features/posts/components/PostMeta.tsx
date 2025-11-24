import type { Post } from "../types/post.type";
import { Avatar } from "./Avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";

dayjs.extend(relativeTime);
dayjs.locale("pl");

type PostMetaProps = {
  post: Post;
};

const formatDate = (date: any) => {
  if (!date) return "";
  // Obsługa Timestamp z Firestore lub stringa ISO
  const d =
    typeof date === "string" ? new Date(date) : new Date(date._seconds * 1000);

  // Jeśli post jest starszy niż 24h, pokaż pełną datę, w przeciwnym razie "X godzin temu"
  if (dayjs().diff(d, "hour") > 24) {
    return dayjs(d).format("D MMMM YYYY");
  }
  return dayjs(d).fromNow();
};

export const PostMeta = ({ post }: PostMetaProps) => {
  return (
    <div className="w-72 inline-flex justify-start items-center gap-2  ">
      <div className="size-10">
        <Avatar src={post.userAvatarUrl} alt={post.userName} />
      </div>

      <div className="self-stretch inline-flex flex-col justify-center items-start">
        <div className="justify-start text-text-main text-sm font-medium font-Albert_Sans">
          {post.userName}
        </div>
        <div className="size- inline-flex justify-center items-center gap-1">
          <div className="justify-start text-text-neutral text-xs font-normal font-Albert_Sans">
            {formatDate(post.createdAt)}{" "}
          </div>
          {/* <div className="size-1 bg-text-neutral rounded-full" />
          <div className="justify-start text-text-neutral text-xs font-normal font-Albert_Sans">
            {post.device}
          </div> */}
        </div>
      </div>
    </div>
  );
};
