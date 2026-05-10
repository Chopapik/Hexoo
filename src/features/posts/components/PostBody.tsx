import type { PublicPostResponseDto } from "../types/post.dto";
import { isAsciiArt } from "../utils/asciiDetector";
import { useMemo } from "react";
import { PostMedia } from "./PostMedia";
import { ExpandableImageThumbnail } from "@/features/shared/components/media/ExpandableImageThumbnail";

type PostBodyProps = {
  post: PublicPostResponseDto;
  isNSFW?: boolean;
  /** Moderation queue: image as thumbnail opening to fullscreen */
  moderationThumbnailImage?: boolean;
  onImageReadyChange?: (isReady: boolean) => void;
};

export const PostBody = ({
  post,
  isNSFW = false,
  moderationThumbnailImage = false,
  onImageReadyChange,
}: PostBodyProps) => {
  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  return (
    <>
      <div className="self-stretch inline-flex flex-col justify-center items-center gap-4 overflow-hidden w-full">
        <div className="self-start flex items-center gap-2">
          {isNSFW && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
              NSFW
            </span>
          )}
          {post.isEdited && (
            <span className="text-[10px] font-medium text-text-neutral/60 italic">
              edytowano
            </span>
          )}
        </div>
        <div
          className={`self-stretch  text-text-main text-base font-normal w-full ${
            isAscii
              ? "ascii-art"
              : "font-sans whitespace-pre-wrap wrap-break-word"
          }`}
        >
          {post.text}
        </div>

        {post.imageUrl &&
          (moderationThumbnailImage ? (
            <ExpandableImageThumbnail
              src={post.imageUrl}
              alt="Treść obrazkowa posta"
            />
          ) : (
            <PostMedia
              src={post.imageUrl}
              alt="Post content"
              onReadyChange={onImageReadyChange}
            />
          ))}
      </div>
    </>
  );
};
