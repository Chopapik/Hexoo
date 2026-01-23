"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";

interface ConfirmDeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function ConfirmDeletePostModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: ConfirmDeletePostModalProps) {
  const footerContent = (
    <ModalFooter
      confirmText="Tak, usuń"
      onCancel={onClose}
      onConfirm={onConfirm}
      isPending={isPending}
      confirmVariant="danger"
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usunąć post?"
      footer={footerContent}
      className="max-w-md"
    >
      <div className="flex flex-col gap-3 pt-1">
        <p className="text-sm text-text-neutral leading-relaxed">
          Czy na pewno chcesz trwale usunąć ten post?
          <br />
          Tej operacji nie będzie można cofnąć.
        </p>
      </div>
    </Modal>
  );
}
