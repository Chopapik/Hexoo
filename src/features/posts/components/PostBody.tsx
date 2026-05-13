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
  const hasBadges = isNSFW || post.isEdited;
  const hasText = post.text.trim().length > 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {hasBadges && (
        <div className="flex items-center gap-2">
          {isNSFW && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/15 px-2.5 py-1 rounded-full border border-red-500/20">
              NSFW
            </span>
          )}
          {post.isEdited && (
            <span className="text-[10px] font-medium text-text-neutral/70 bg-primary-neutral-stroke-default/30 px-2 py-0.5 rounded-full">
              edytowano
            </span>
          )}
        </div>
      )}
      
      {hasText && (
        <p
          className={`text-text-main leading-relaxed ${
            isAscii
              ? "ascii-art text-xs"
              : "font-sans text-sm sm:text-[15px] whitespace-pre-wrap break-words"
          }`}
        >
          {post.text}
        </p>
      )}

      {post.imageUrl && (
        <div className="mt-1 -mx-4 sm:-mx-5">
          {moderationThumbnailImage ? (
            <ExpandableImageThumbnail
              src={post.imageUrl}
              alt="Treść obrazkowa posta"
            />
          ) : (
            <div className="px-4 sm:px-5">
              <PostMedia
                src={post.imageUrl}
                alt="Post content"
                onReadyChange={onImageReadyChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
