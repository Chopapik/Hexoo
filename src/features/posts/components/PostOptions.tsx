"use client";

import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  BsThreeDots,
  BsFlag,
  BsShieldExclamation,
  BsTrash,
} from "react-icons/bs";
import ReportPostModal from "./ReportPostModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import ConfirmDeletePostModal from "./ConfirmDeletePostModal.tsx";

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export default function PostOptions({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const isModerator = currentUser?.role === "moderator";
  const isAdmin = currentUser?.role === "admin";
  const isAuthor = currentUser?.uid === authorId;

  const modAction = useMutation({
    mutationFn: async (action: "reject" | "quarantine") => {
      return axiosInstance.post("/moderator/review", { postId, action });
    },
    onSuccess: (_, action) => {
      const msg =
        action === "reject"
          ? "Post został usunięty."
          : "Post przeniesiony do kwarantanny.";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (action === "reject") setIsDeleteModalOpen(false);
    },
    onError: () => {
      toast.error("Wystąpił błąd podczas akcji moderatora.");
    },
  });

  if (isAuthor && (!isModerator || !isAdmin)) return null;

  return (
    <>
      {isReportModalOpen && (
        <ReportPostModal
          postId={postId}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {currentUser && (
        <>
          <ConfirmDeletePostModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            isPending={modAction.isPending}
            onConfirm={() => modAction.mutate("reject")}
          />
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="p-2 text-text-neutral hover:text-text-main transition-colors rounded-xl hover:bg-primary-neutral-background-hover">
                <DotsIcon />
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
                className="absolute  right-0 mt-2 w-56 origin-top-right bg-primary-neutral-background-default border border-primary-neutral-stroke-default rounded-xl shadow-2xl z-50 overflow-hidden focus:outline-none"
              >
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

                {isModerator && (
                  <div className="p-1 border-t border-white/10">
                    {!isAuthor && (
                      <div className="px-2 py-1.5 text-[10px] text-text-neutral/50 uppercase tracking-widest font-bold">
                        Panel Moderatora
                      </div>
                    )}

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => modAction.mutate("quarantine")}
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
                          onClick={() => setIsDeleteModalOpen(true)}
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
        </>
      )}
    </>
  );
}
