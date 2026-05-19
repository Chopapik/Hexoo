"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useDeletePost from "../hooks/useDeletePost";
import { useI18n } from "@/i18n/useI18n";

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export default function DeletePostModal({
  isOpen,
  onClose,
  postId,
}: DeletePostModalProps) {
  const { t } = useI18n();
  const { deletePost, isPending } = useDeletePost(postId, () => {
    onClose();
  });

  const footerContent = (
    <ModalFooter
      confirmText={t("post.delete.confirm")}
      onCancel={onClose}
      onConfirm={() => deletePost()}
      isPending={isPending}
      confirmVariant="danger"
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("post.delete.title")}
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-text-neutral">
          {t("post.delete.body")}
        </p>
      </div>
    </Modal>
  );
}
