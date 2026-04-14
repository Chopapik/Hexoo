"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useDeleteComment from "../hooks/useDeleteComment";

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
  const { deleteComment, isPending } = useDeleteComment(
    commentId,
    postId,
    () => {
      onClose();
    },
  );

  const footerContent = (
    <ModalFooter
      confirmText="Tak, usuń komentarz"
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
      title="Czy na pewno chcesz usunąć komentarz?"
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-text-neutral">
          Ta operacja jest nieodwracalna. Komentarz zostanie trwale usunięty.
        </p>
      </div>
    </Modal>
  );
}
