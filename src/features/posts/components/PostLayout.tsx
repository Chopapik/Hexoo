import type { Post } from "../types/post.type";
import { PostBody } from "./PostBody";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="w-full max-w-[920px] p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex flex-col justify-start items-start gap-4">
      <PostMeta post={post} />
      <PostBody post={post} />
      <PostFooter post={post} />
    </div>
  );
};
