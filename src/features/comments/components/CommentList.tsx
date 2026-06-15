"use client";

import type { PublicCommentResponseDto } from "../types/comment.dto";
import { CommentItem } from "./CommentItem";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";
import { useI18n } from "@/i18n/useI18n";

interface CommentListProps {
  comments: PublicCommentResponseDto[];
  isLoading: boolean;
}

export const CommentList = ({ comments, isLoading }: CommentListProps) => {
  const { t } = useI18n();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <AppLoader size="lg" className="text-foreground-secondary-default" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-foreground-secondary-default text-sm font-sans">
          {t("comment.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
