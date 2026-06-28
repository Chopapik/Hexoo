import Button from "../ui/Button";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "../../utils/utils";

interface ModalFooterProps {
  cancelText?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  confirmVariant?: "default" | "danger" | "secondary";
  confirmSize?: "sm" | "md" | "xl";
  cancelSize?: "sm" | "md" | "xl";
  disabled?: boolean;
  confirmDisabled?: boolean;
  className?: string;
}

export default function ModalFooter({
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  isPending = false,
  confirmVariant = "default",
  confirmSize = "md",
  cancelSize = "md",
  disabled = false,
  confirmDisabled = false,
  className = "",
}: ModalFooterProps) {
  const { t } = useI18n();
  const resolvedCancelText = cancelText ?? t("common.cancel");

  return (
    <div className={cn("flex w-full flex-wrap items-center justify-end gap-2 sm:flex-nowrap", className)}>
      <Button
        onClick={onCancel}
        text={resolvedCancelText}
        size={cancelSize}
        variant="outline"
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
