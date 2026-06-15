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
import { Avatar } from "@/features/shared/components/ui/Avatar";
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
import { useI18n } from "@/i18n/useI18n";

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
  const { lang, t } = useI18n();
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
          ? t("comment.toast.deleted")
          : t("comment.toast.quarantined");
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["comments", comment.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPendingModAction(null);
    },
    onError: () => {
      toast.error(t("post.toast.modActionError"));
    },
  });

  const handleModReasonConfirm = (justification: string) => {
    if (!pendingModAction) return;
    modAction.mutate({ action: pendingModAction, justification });
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const avatarClass = moderationProminent
    ? "size-10 rounded-xl"
    : "size-9 rounded-xl md:size-10";
  const avatarPx = 40;
  const nameClass = moderationProminent
    ? "rounded-sm font-sans text-base font-semibold leading-[1.2] text-foreground-primary-default hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
    : "rounded-sm font-sans text-sm font-medium leading-[1.2] text-foreground-primary-default hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60";
  const bodyClass = moderationProminent
    ? "text-foreground-primary-default text-base leading-relaxed font-sans whitespace-pre-wrap wrap-break-word"
    : "text-foreground-primary-default text-sm leading-[1.45] font-sans whitespace-pre-wrap wrap-break-word";
  const dateClass = moderationProminent
    ? "text-foreground-secondary-default text-sm font-sans"
    : "font-sans text-xs leading-[1.2] text-foreground-secondary-default";

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
        className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-2 gap-y-3 border-b border-divider-subtle py-3 last:border-b-0 md:grid-cols-[40px_minmax(0,1fr)]"
      >
        <div className="shrink-0" onClick={handleLinkClick}>
          <Link
            href={`/profile/${comment.userId}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
          >
            <Avatar
              src={comment.userAvatarUrl ?? undefined}
              alt={comment.userName}
              className={avatarClass}
              width={avatarPx}
              height={avatarPx}
            />
          </Link>
        </div>

        <div className="contents">
          <div className="col-start-2 row-start-1 flex min-w-0 items-start justify-between">
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
              <Link
                href={`/profile/${comment.userId}`}
                className={nameClass}
                onClick={handleLinkClick}
              >
                {comment.userName}
              </Link>
              <div className="flex items-center gap-2">
                <span className={dateClass}>
                  {formatSmartDate(comment.createdAt, lang)}
                </span>
                {comment.isEdited && (
                  <span className="text-[10px] font-medium italic text-foreground-secondary-default/60">
                    {t("post.edited")}
                  </span>
                )}
              </div>
            </div>

            {showMenu && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="flex size-7 items-center justify-center rounded-xl text-foreground-secondary-default transition-colors hover:bg-button-transparent-background-hover hover:text-foreground-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60">
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
                    className="absolute right-0 mt-1 w-48 origin-top-right bg-surface-card-background-default border border-surface-card-border-default rounded-xl shadow-2xl z-50 overflow-hidden focus:outline-none"
                  >
                    {isAuthor && (
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setIsEditModalOpen(true)}
                              className={`${
                                active
                                  ? "bg-button-transparent-background-hover text-foreground-primary-default"
                                  : "text-foreground-secondary-default"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsPencil /> {t("comment.options.edit")}
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setIsDeleteModalOpen(true)}
                              className={`${
                                active
                                  ? "bg-button-danger-background-disabled-from text-button-danger-background-default-from"
                                  : "text-button-danger-background-default-from"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsTrash /> {t("comment.options.delete")}
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
                                  ? "bg-button-transparent-background-hover text-foreground-primary-default"
                                  : "text-foreground-secondary-default"
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <BsFlag /> {t("comment.options.report")}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    )}

                    {(isModerator || isAdmin) && (
                      <div className="p-1 border-t border-divider-default">
                        {!isAuthor && (
                          <div className="px-2 py-1.5 text-[10px] text-foreground-secondary-default/50 uppercase tracking-widest font-bold">
                            {t("post.options.moderatorPanel")}
                          </div>
                        )}

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setPendingModAction("quarantine")}
                              disabled={modAction.isPending}
                              className={`${
                                active
                                  ? "bg-button-warning-background-disabled-from text-button-warning-background-default-from"
                                  : "text-button-warning-background-default-from"
                              } group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors`}
                            >
                              <BsShieldExclamation /> {t("post.options.quarantine")}
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
                                  ? "bg-button-danger-background-disabled-from text-button-danger-background-default-from"
                                  : "text-button-danger-background-default-from"
                              } group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors`}
                            >
                              <BsTrash /> {t("comment.options.deleteNow")}
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

          <p className={`${bodyClass} col-span-2 row-start-2`}>
            {comment.text}
          </p>
          {comment.imageUrl &&
            (moderationCompactImage ? (
              <div className="col-span-2">
                <ExpandableImageThumbnail
                  src={comment.imageUrl}
                  alt={t("comment.imageAlt")}
                />
              </div>
            ) : (
              <img
                src={comment.imageUrl}
                alt={t("comment.imageAlt")}
                className="col-span-2 max-h-[279px] w-full rounded-xl border border-surface-card-border-default object-cover"
              />
            ))}
        </div>
      </div>
    </>
  );
};
