"use client";

import { Comment } from "../types/comment.type";
import { CommentItem } from "./CommentItem";
import { Loader2 } from "lucide-react";

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
}

export const CommentList = ({ comments, isLoading }: CommentListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-text-neutral" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center w-[1000px]">
        <p className="text-text-neutral text-sm font-Albert_Sans">
          Brak komentarzy
        </p>
        <p className="text-text-neutral/60 text-xs font-Albert_Sans mt-1">
          Bądź pierwszy i dodaj komentarz!
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
