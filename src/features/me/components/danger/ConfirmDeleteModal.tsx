"use client";

import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";

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
        text="Tak, usuń konto"
        size="sm"
        variant="danger"
        isLoading={isPending}
      />
    </div>
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
