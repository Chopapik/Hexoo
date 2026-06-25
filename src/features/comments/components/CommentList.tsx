"use client";

import type { PublicCommentResponseDto } from "../types/comment.dto";
import { CommentItem } from "./CommentItem";

import { AppLoader } from "@/features/shared/components/ui/AppLoader";

import { useI18n } from "@/i18n/useI18n";

import { cn } from "@/features/shared/utils/utils";

interface CommentListProps {
  comments: PublicCommentResponseDto[];
  isLoading: boolean;
  className?: string;
}

const commentsStatusClassName =
  "flex w-full min-w-0 flex-1 self-stretch items-center justify-center px-4 py-8 text-center";

export const CommentList = ({
  comments,
  isLoading,
  className,
}: CommentListProps) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className={cn(commentsStatusClassName, className)}>
        <AppLoader size="lg" className="text-foreground-secondary-default" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={cn(commentsStatusClassName, className)}>
        <p className="font-sans text-sm text-foreground-secondary-default">
          {t("comment.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col", className)}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
