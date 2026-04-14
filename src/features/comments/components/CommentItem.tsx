"use client";

import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsThreeDots, BsPencil, BsTrash } from "react-icons/bs";
import type { PublicCommentResponseDto } from "../types/comment.dto";
import { Avatar } from "@/features/posts/components/Avatar";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";
import Link from "next/link";
import { ExpandableImageThumbnail } from "@/features/shared/components/media/ExpandableImageThumbnail";
import { useAppStore } from "@/lib/store/store";
import EditCommentModal from "./EditCommentModal";
import DeleteCommentModal from "./DeleteCommentModal";

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
  const currentUser = useAppStore((s) => s.auth.user);
  const isAuthor = currentUser?.uid === comment.userId;

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

            {isAuthor && (
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
                    className="absolute right-0 mt-1 w-44 origin-top-right bg-primary-neutral-background-default border border-primary-neutral-stroke-default rounded-xl shadow-2xl z-50 overflow-hidden focus:outline-none"
                  >
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
