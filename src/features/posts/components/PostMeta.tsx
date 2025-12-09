import type { Post } from "../types/post.type";
import { Avatar } from "./Avatar";
import "dayjs/locale/pl";
import PostOptions from "./PostOptions";
import Link from "next/link";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";

type PostMetaProps = {
  post: Post;
};

export const PostMeta = ({ post }: PostMetaProps) => {
  return (
    <div className="w-full flex justify-between items-start">
      <div className="inline-flex justify-start items-center gap-2">
        <div className="size-10">
          <Link href={`/${post.userName}`}>
            <Avatar
              src={post.userAvatarUrl ?? undefined}
              alt={post.userName ?? undefined}
            />
          </Link>
        </div>
        <div className="self-stretch inline-flex flex-col justify-center items-start">
          <div className="justify-start text-text-main text-sm font-medium font-Albert_Sans">
            {post.userName}
          </div>
          <div className="size- inline-flex justify-center items-center gap-1">
            <div className="justify-start text-text-neutral text-xs font-normal font-Albert_Sans">
              {formatSmartDate(post.createdAt)}
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
