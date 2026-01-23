"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: ConfirmDeleteModalProps) {
  const footerContent = (
    <ModalFooter
      confirmText="Tak, usuń konto"
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
      title="Czy na pewno chcesz usunąć konto?"
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-text-neutral">
          Ta operacja jest nieodwracalna. Wszystkie Twoje dane, w tym posty,
          komentarze i ustawienia, zostaną trwale usunięte.
        </p>
      </div>
    </Modal>
  );
}
