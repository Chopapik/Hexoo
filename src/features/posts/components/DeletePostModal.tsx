"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import useDeletePost from "../hooks/useDeletePost";

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
  const { deletePost, isPending } = useDeletePost(postId, () => {
    onClose();
  });

  const footerContent = (
    <ModalFooter
      confirmText="Tak, usuń post"
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
      title="Czy na pewno chcesz usunąć post?"
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-text-neutral">
          Ta operacja jest nieodwracalna. Post zostanie trwale usunięty.
        </p>
      </div>
    </Modal>
  );
}
