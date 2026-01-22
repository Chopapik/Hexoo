import Modal from "./Modal";
import Button from "@/features/shared/components/ui/Button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title = "Komunikat",
  message,
}: AlertModalProps) {
  const footerContent = (
    <div className="flex justify-end w-full">
      <Button onClick={onClose} text="OK" size="sm"  />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footerContent}
      className="max-w-md"
    >
      <div className="py-2 text-text-main text-base leading-relaxed">
        {message}
      </div>
    </Modal>
  );
}
