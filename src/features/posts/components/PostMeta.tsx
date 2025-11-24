import type { Post } from "../types/post.type";
import { Avatar } from "./Avatar";
import dayjs from "dayjs";

type PostMetaProps = {
  post: Post;
};

export const PostMeta = ({ post }: PostMetaProps) => {
  return (
    <div className="w-72 inline-flex justify-start items-center gap-2  ">
      <div className="size-10">
        <Avatar src={post.userAvatarUrl} alt={post.userName} />
      </div>

      <div className="self-stretch inline-flex flex-col justify-center items-start">
        <div className="justify-start text-text-main text-sm font-medium font-['Roboto']">
          {post.userName}
        </div>
        <div className="size- inline-flex justify-center items-center gap-1">
          <div className="justify-start text-text-neutral text-xs font-normal font-['Roboto']">
            {dayjs(post.createdAt).format("DD/MM/YYYY")}
          </div>
          {/* <div className="size-1 bg-text-neutral rounded-full" /> */}
          {/* <div className="justify-start text-text-neutral text-xs font-normal font-['Roboto']">
            {post.device}
          </div> */}
        </div>
      </div>
    </div>
  );
};
