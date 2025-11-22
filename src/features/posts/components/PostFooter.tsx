import type { Post } from "../types/post.type";
import { CommentIcon } from "../icons/CommentIcon";
import { LikeIcon } from "../icons/LikeIcon";

type PostFooterProps = {
  post: Post;
};

export const PostFooter = ({ post }: PostFooterProps) => {
  return (
    <div
      data-property-1="Default"
      className="size- bg-white/0 inline-flex justify-start items-start gap-4 overflow-hidden"
    >
      <div className="size- flex justify-start items-center gap-1.5">
        <div data-svg-wrapper>
          <LikeIcon />
        </div>
        <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
          1
        </div>
      </div>
      <div className="size- flex justify-start items-center gap-1.5">
        <div data-svg-wrapper>
          <CommentIcon />
        </div>
        <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
          1
        </div>
      </div>
    </div>
  );
};
