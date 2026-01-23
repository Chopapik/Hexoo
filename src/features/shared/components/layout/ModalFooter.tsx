import Button from "../ui/Button";

interface ModalFooterProps {
  cancelText?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  confirmVariant?: "gradient-fuchsia" | "danger" | "secondary";
  confirmSize?: "sm" | "md" | "lg";
  cancelSize?: "sm" | "md" | "lg";
  disabled?: boolean;
  confirmDisabled?: boolean;
  className?: string;
}

export default function ModalFooter({
  cancelText = "Anuluj",
  confirmText,
  onCancel,
  onConfirm,
  isPending = false,
  confirmVariant = "gradient-fuchsia",
  confirmSize = "md",
  cancelSize = "md",
  disabled = false,
  confirmDisabled = false,
  className = "",
}: ModalFooterProps) {
  return (
    <div className={`flex gap-3 justify-end w-full ${className}`}>
      <Button
        onClick={onCancel}
        text={cancelText}
        size={cancelSize}
        variant="secondary"
        disabled={isPending || disabled}
      />
      <Button
        onClick={onConfirm}
        text={confirmText}
        size={confirmSize}
        variant={confirmVariant}
        isLoading={isPending}
        disabled={disabled || confirmDisabled}
      />
    </div>
  );
}
