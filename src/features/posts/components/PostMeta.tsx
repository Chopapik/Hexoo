import type { Post } from "../types/post.type";
import { Avatar } from "./Avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pl";
import PostOptions from "./PostOptions";

dayjs.extend(relativeTime);
dayjs.locale("pl");

type PostMetaProps = {
  post: Post;
};

const formatDate = (date: any) => {
  if (!date) return "";
  const d =
    typeof date === "string" ? new Date(date) : new Date(date._seconds * 1000);

  if (dayjs().diff(d, "hour") > 24) {
    return dayjs(d).format("D MMMM YYYY");
  }
  return dayjs(d).fromNow();
};

export const PostMeta = ({ post }: PostMetaProps) => {
  return (
    <div className="w-full flex justify-between items-start">
      <div className="inline-flex justify-start items-center gap-2">
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
          </div>
        </div>
      </div>

      <div className="pt-1">
        <PostOptions postId={post.id} authorId={post.userId} />
      </div>
    </div>
  );
};
