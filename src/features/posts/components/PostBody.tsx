import Link from "next/link";
import type { Post } from "../types/post.type";

type PostBodyProps = {
  post: Post;
};

export const PostBody = ({ post }: PostBodyProps) => {
  console.log(post);
  return (
    <>
      <div className="self-stretch inline-flex flex-col justify-center items-center gap-4 overflow-hidden">
        <div className="self-stretch justify-start text-text-main text-base font-normal font-Albert_Sans">
          {post.text}
        </div>

        {post.imageUrl && (
          <img
            className="w-auto max-h-96 relative rounded-xl "
            src={post.imageUrl}
          />
        )}
      </div>
    </>
  );
};
