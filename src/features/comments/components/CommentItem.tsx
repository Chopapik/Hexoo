"use client";

import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BsThreeDots,
  BsPencil,
  BsTrash,
  BsFlag,
  BsShieldExclamation,
} from "react-icons/bs";
import type { PublicCommentResponseDto } from "../types/comment.dto";
import { Avatar } from "@/features/posts/components/Avatar";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";
import Link from "next/link";
import { ExpandableImageThumbnail } from "@/features/shared/components/media/ExpandableImageThumbnail";
import { useAppStore } from "@/lib/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import EditCommentModal from "./EditCommentModal";
import DeleteCommentModal from "./DeleteCommentModal";
import ReportCommentModal from "./ReportCommentModal";
import ModerationReasonModal from "@/features/posts/components/ModerationReasonModal";

type ModActionType = "quarantine" | "reject" | null;

interface CommentItemProps {
  comment: PublicCommentResponseDto;
  /** Moderation queue: image as thumbnail with fullscreen lightbox */
  moderationCompactImage?: boolean;
  /** Moderation queue: larger body text than the parent-post context block */
  moderationProminent?: boolean;
}

export const CommentItem = ({
  comment,
  moderationCompactImage = false,
  moderationProminent = false,
}: CommentItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [pendingModAction, setPendingModAction] = useState<ModActionType>(null);
  const currentUser = useAppStore((s) => s.auth.user);
  const queryClient = useQueryClient();

  const isAuthor = currentUser?.uid === comment.userId;
  const isModerator = currentUser?.role === "moderator";
  const isAdmin = currentUser?.role === "admin";

  const modAction = useMutation({
    mutationFn: async ({
      action,
      justification,
    }: {
      action: "reject" | "quarantine";
      justification: string;
    }) => {
      return fetchClient.post("/moderator/review-comment", {
        commentId: comment.id,
        action,
        justification,
        categories: [],
      });
    },
    onSuccess: (_, { action }) => {
      const msg =
        action === "reject"
          ? "Komentarz został usunięty."
          : "Komentarz przeniesiony do kwarantanny.";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["comments", comment.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPendingModAction(null);
    },
    onError: () => {
      toast.error("Wystąpił błąd podczas akcji moderatora.");
    },
  });

  const handleModReasonConfirm = (justification: string) => {
    if (!pendingModAction) return;
    modAction.mutate({ action: pendingModAction, justification });
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const avatarClass = moderationProminent ? "size-10" : "size-8";
  const avatarPx = moderationProminent ? 40 : 32;
  const nameClass = moderationProminent
    ? "text-text-main text-base font-semibold font-Albert_Sans hover:underline"
    : "text-text-main text-sm font-medium font-Albert_Sans hover:underline";
  const bodyClass = moderationProminent
    ? "text-text-main text-base leading-relaxed font-Albert_Sans whitespace-pre-wrap wrap-break-word"
    : "text-text-main text-sm font-Albert_Sans whitespace-pre-wrap wrap-break-word";
  const dateClass = moderationProminent
    ? "text-text-neutral text-sm font-Albert_Sans"
    : "text-text-neutral text-xs font-Albert_Sans";

  const showMenu = !!currentUser;

  return (
    <>
      {isEditModalOpen && (
        <EditCommentModal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          comment={comment}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteCommentModal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          commentId={comment.id}
          postId={comment.postId}
        />
      )}

      {isReportModalOpen && (
        <ReportCommentModal
          commentId={comment.id}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {pendingModAction && currentUser && (
        <ModerationReasonModal
          isOpen={true}
          action={pendingModAction}
          isPending={modAction.isPending}
          onClose={() => setPendingModAction(null)}
          onConfirm={handleModReasonConfirm}
          resource="comment"
        />
      )}

      <div
        className={`flex gap-3 py-3 border-b border-primary-neutral-stroke-default/30 last:border-b-0 ${moderationProminent ? "gap-4" : ""}`}
      >
        <div className="shrink-0" onClick={handleLinkClick}>
          <Link href={`/profile/${comment.userName}`}>
            <Avatar
              src={comment.userAvatarUrl ?? undefined}
              alt={comment.userName}
              className={avatarClass}
              width={avatarPx}
              height={avatarPx}
            />
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${comment.userName}`}
                className={nameClass}
                onClick={handleLinkClick}
              >
                {comment.userName}
              </Link>
              <span className={dateClass}>
                {formatSmartDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-[10px] font-medium text-text-neutral/60 italic">
                  edytowano
                </span>
              )}
            </div>

            {showMenu && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="p-1 text-text-neutral hover:text-text-main transition-colors rounded-lg hover:bg-primary-neutral-background-hover">
                  <BsThreeDots size={14} />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    modal={false}
                    className="absolute right-0 mt-1 w-48 origin-top-right bg-primary-neutral-background-default border border-primary-neutral-stroke-default rounded-xl shadow-2xl z-50 overflow-hidden focus:outline-none"
                  >
                    {isAuthor && (
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setIsEditModalOpen(true)}
                              className={`${
                                active
                                  ? "bg-primary-neutral-background-hover text-text-main"
                                  : "text-text-neutral"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsPencil /> Edytuj
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setIsDeleteModalOpen(true)}
                              className={`${
                                active
                                  ? "bg-red-500/10 text-red-400"
                                  : "text-red-500"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsTrash /> Usuń
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}

                    {!isAuthor && (
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setIsReportModalOpen(true)}
                              className={`${
                                active
                                  ? "bg-primary-neutral-background-hover text-text-main"
                                  : "text-text-neutral"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsFlag /> Zgłoś naruszenie
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}

                    {(isModerator || isAdmin) && (
                      <div className="p-1 border-t border-white/10">
                        {!isAuthor && (
                          <div className="px-2 py-1.5 text-[10px] text-text-neutral/50 uppercase tracking-widest font-bold">
                            Panel Moderatora
                          </div>
                        )}

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setPendingModAction("quarantine")}
                              disabled={modAction.isPending}
                              className={`${
                                active
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "text-yellow-500"
                              } group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors`}
                            >
                              <BsShieldExclamation /> Kwarantanna
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setPendingModAction("reject")}
                              disabled={modAction.isPending}
                              className={`${
                                active
                                  ? "bg-red-500/10 text-red-400"
                                  : "text-red-500"
                              } group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors`}
                            >
                              <BsTrash /> Usuń natychmiast
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>

          <p className={bodyClass}>{comment.text}</p>
          {comment.imageUrl &&
            (moderationCompactImage ? (
              <div className="mt-2">
                <ExpandableImageThumbnail
                  src={comment.imageUrl}
                  alt="Zdjęcie komentarza"
                />
              </div>
            ) : (
              <img
                src={comment.imageUrl}
                alt="Zdjęcie komentarza"
                className="mt-2 w-full max-w-xs rounded-xl border border-primary-neutral-stroke-default object-cover"
              />
            ))}
        </div>
      </div>
    </>
  );
};
