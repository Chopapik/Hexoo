import type { Post } from "../types/post.type";
import { CommentIcon } from "./icons/CommentIcon";
import { LikeIcon } from "./icons/LikeIcon";

type PostFooterProps = {
  post: Post;
};

export const PostFooter = ({ post }: PostFooterProps) => {
  return (
    <div
      data-property-1="Default"
      className="w-24 px-2 bg-white/0 inline-flex justify-start items-start gap-2 overflow-hidden"
    >
      <div
        data-animseq="1"
        data-status="Unliked"
        className="size- flex justify-start items-center gap-1.5"
      >
        <div data-svg-wrapper className="relative">
          <LikeIcon />
        </div>
        <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
          {post.likes}
        </div>
      </div>
      <div
        data-theme="Dark"
        className="h-6 flex justify-start items-center gap-1.5"
      >
        <div data-svg-wrapper className="relative">
          <CommentIcon />
        </div>
        <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
          1
        </div>
      </div>
    </div>
  );
};
