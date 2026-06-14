"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useDeleteComment from "../hooks/useDeleteComment";
import { useI18n } from "@/i18n/useI18n";

interface DeleteCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  postId: string;
}

export default function DeleteCommentModal({
  isOpen,
  onClose,
  commentId,
  postId,
}: DeleteCommentModalProps) {
  const { t } = useI18n();
  const { deleteComment, isPending } = useDeleteComment(
    commentId,
    postId,
    () => {
      onClose();
    },
  );

  const footerContent = (
    <ModalFooter
      confirmText={t("comment.delete.confirm")}
      onCancel={onClose}
      onConfirm={() => deleteComment()}
      isPending={isPending}
      confirmVariant="danger"
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("comment.delete.title")}
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-foreground-secondary-default">
          {t("comment.delete.body")}
        </p>
      </div>
    </Modal>
  );
}
