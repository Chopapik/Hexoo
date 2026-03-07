import Link from "next/link";
import type { PublicPostDto } from "../types/post.dto";
import { isAsciiArt } from "../utils/asciiDetector";
import { useMemo } from "react";

type PostBodyProps = {
  post: PublicPostDto;
  isNSFW?: boolean;
};

export const PostBody = ({ post, isNSFW = false }: PostBodyProps) => {
  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  return (
    <>
      <div className="self-stretch inline-flex flex-col justify-center items-center gap-4 overflow-hidden w-full">
        {isNSFW && (
          <span className="self-start text-[10px] font-semibold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
            NSFW
          </span>
        )}
        <div
          className={`self-stretch  text-text-main text-base font-normal w-full ${
            isAscii
              ? "ascii-art"
              : "font-Albert_Sans whitespace-pre-wrap wrap-break-word"
          }`}
        >
          {post.text}
        </div>

        {post.imageUrl && (
          <img
            className="w-full max-w-[450px] relative rounded-xl object-cover"
            src={post.imageUrl}
            alt="Post content"
          />
        )}
      </div>
    </>
  );
};
