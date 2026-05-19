"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { useI18n } from "@/i18n/useI18n";

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
  const { t } = useI18n();
  const footerContent = (
    <ModalFooter
      confirmText={t("settings.danger.deleteConfirm")}
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
      title={t("settings.danger.deleteTitle")}
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-text-neutral">
          {t("settings.danger.deleteBody")}
        </p>
      </div>
    </Modal>
  );
}
