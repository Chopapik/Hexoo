import type { Post } from "../types/post.type";

type PostBodyProps = {
  post: Post;
};

const PLACEHOLDER_IMAGE = "https://placehold.co/500x426";

export const PostBody = ({ post }: PostBodyProps) => {
  const imageSrc = post.imageUrl ?? PLACEHOLDER_IMAGE;

  return (
    <>
      <div className="self-stretch inline-flex flex-col justify-center items-center gap-4 overflow-hidden">
        <div className="self-stretch justify-start text-text-main text-base font-normal font-['Roboto']">
          {post.text}
        </div>
        <img className="w-auto max-h-96 relative rounded-xl " src={imageSrc} />
      </div>
    </>
  );
};
