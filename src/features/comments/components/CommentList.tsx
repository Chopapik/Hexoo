"use client";

import type { PublicCommentResponseDto } from "../types/comment.dto";
import { CommentItem } from "./CommentItem";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";

interface CommentListProps {
  comments: PublicCommentResponseDto[];
  isLoading: boolean;
}

export const CommentList = ({ comments, isLoading }: CommentListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <AppLoader size="lg" className="text-text-neutral" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-text-neutral text-sm font-sans">
          Brak komentarzy
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
