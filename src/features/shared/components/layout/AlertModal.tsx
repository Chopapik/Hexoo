import Modal from "./Modal";
import Button from "@/features/shared/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
}: AlertModalProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("common.message");
  const footerContent = (
    <div className="flex justify-end w-full">
      <Button onClick={onClose} text="OK" size="sm"  />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resolvedTitle}
      footer={footerContent}
      className="max-w-md"
    >
      <div className="py-2 text-foreground-primary-default text-base leading-relaxed">
        {message}
      </div>
    </Modal>
  );
}
