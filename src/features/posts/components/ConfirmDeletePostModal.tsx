"use client";

import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { useI18n } from "@/i18n/useI18n";

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
  const { t } = useI18n();
  const footerContent = (
    <ModalFooter
      confirmText={t("post.delete.confirm")}
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
      title={t("post.delete.title")}
      footer={footerContent}
      className="max-w-md"
    >
      <div className="flex flex-col gap-3 pt-1">
        <p className="text-sm text-text-neutral leading-relaxed">
          {t("post.delete.body")}
        </p>
      </div>
    </Modal>
  );
}
