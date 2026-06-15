"use client";

import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAppStore } from "@/lib/store/store";
import {
  BsThreeDots,
  BsFlag,
  BsShieldExclamation,
  BsTrash,
  BsPencil,
} from "react-icons/bs";
import ReportPostModal from "./ReportPostModal";
import ModerationReasonModal from "./ModerationReasonModal";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import type { PublicPostResponseDto } from "../types/post.dto";
import { useI18n } from "@/i18n/useI18n";

type ModActionType = "quarantine" | "reject" | null;

export default function PostOptions({
  postId,
  authorId,
  post,
}: {
  postId: string;
  authorId: string;
  post: PublicPostResponseDto;
}) {
  const { t } = useI18n();
  const [pendingAction, setPendingAction] = useState<ModActionType>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const currentUser = useAppStore((s) => s.auth.user);
  const queryClient = useQueryClient();

  const isModerator = currentUser?.role === "moderator";
  const isAdmin = currentUser?.role === "admin";
  const isAuthor = currentUser?.uid === authorId;

  const modAction = useMutation({
    mutationFn: async ({
      action,
      justification,
    }: {
      action: "reject" | "quarantine";
      justification: string;
    }) => {
      return fetchClient.post("/moderator/review", {
        postId,
        action,
        justification,
        categories: [],
      });
    },
    onSuccess: (_, { action }) => {
      const msg =
        action === "reject"
          ? t("post.toast.deleted")
          : t("post.toast.quarantined");
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPendingAction(null);
    },
    onError: () => {
      toast.error(t("post.toast.modActionError"));
    },
  });

  const handleReasonConfirm = (justification: string) => {
    if (!pendingAction) return;
    modAction.mutate({ action: pendingAction, justification });
  };

  if (!currentUser) return null;

  return (
    <>
      {isReportModalOpen && (
        <ReportPostModal
          postId={postId}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {pendingAction && currentUser && (
        <ModerationReasonModal
          isOpen={true}
          action={pendingAction}
          isPending={modAction.isPending}
          onClose={() => setPendingAction(null)}
          onConfirm={handleReasonConfirm}
        />
      )}

      {isEditModalOpen && (
        <EditPostModal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
        />
      )}

      {isDeleteModalOpen && (
        <DeletePostModal
          isOpen={true}
          onClose={() => setIsDeleteModalOpen(false)}
          postId={postId}
        />
      )}

      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex size-7 items-center justify-center rounded-xl text-foreground-secondary-default transition-colors hover:bg-button-transparent-background-hover hover:text-foreground-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60">
            <BsThreeDots size={16} />
          </Menu.Button>
        </div>

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
            className="absolute right-0 mt-2 w-56 origin-top-right bg-surface-card-background-default border border-surface-card-border-default rounded-xl shadow-2xl z-50 overflow-hidden focus:outline-none"
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
                      <BsPencil /> {t("post.options.edit")}
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
                      <BsTrash /> {t("post.options.delete")}
                    </button>
                  )}
                </Menu.Item>
              </div>
            )}

            {!isAuthor && (
              <div
                className={`p-1 ${isAuthor ? "border-t border-divider-default" : ""}`}
              >
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
                      <BsFlag /> {t("post.options.report")}
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
                      onClick={() => setPendingAction("quarantine")}
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
                      onClick={() => setPendingAction("reject")}
                      disabled={modAction.isPending}
                      className={`${
                        active
                          ? "bg-button-danger-background-disabled-from text-button-danger-background-default-from"
                          : "text-button-danger-background-default-from"
                      } group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors`}
                    >
                      <BsTrash /> {t("post.options.deleteNow")}
                    </button>
                  )}
                </Menu.Item>
              </div>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
