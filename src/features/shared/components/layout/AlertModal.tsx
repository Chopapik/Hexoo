import Modal from "./Modal";

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
      <button
        onClick={onClose}
        className="px-6 py-2 bg-white text-black rounded-xl hover:opacity-90 font-medium shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all"
      >
        OK
      </button>
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
