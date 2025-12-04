"use client";

import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";

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
    <div className="flex gap-3 justify-end w-full">
      <Button
        onClick={onClose}
        text="Anuluj"
        size="sm"
        variant="icon-fuchsia-ghost"
        disabled={isPending}
      />
      <Button
        onClick={onConfirm}
        text={isPending ? "Usuwanie..." : "Tak, usuń"}
        size="sm"
        variant="danger"
        disabled={isPending}
      />
    </div>
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
