"use client";

import TextInput from "@/features/shared/components/ui/TextInput";
import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import { useUpdatePassword } from "../../hooks/useUpdatePassword";
import useUpdatePasswordForm from "../../hooks/useUpdatePasswordForm";
import { parseErrorMessages } from "../../utils/updatePasswordErrorMap";
import { useI18n } from "@/i18n/useI18n";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { lang, t } = useI18n();
  const { register, errors, handleSubmit, handleErrorsMessages } =
    useUpdatePasswordForm();

  const { updatePassword, isPending } = useUpdatePassword(handleErrorsMessages);

  const onSubmit = handleSubmit(async (data) => {
    const success = await updatePassword(data);
    if (success) {
      onClose();
    }
  });

  const footerContent = (
    <ModalFooter
      confirmText={t("common.saveChanges")}
      onCancel={onClose}
      onConfirm={onSubmit}
      isPending={isPending}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("settings.account.passwordTitle")}
      footer={footerContent}
    >
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-6 md:p-8">
        <TextInput
          type="password"
          label={t("settings.account.currentPassword")}
          {...register("oldPassword")}
          placeholder={t("settings.account.currentPasswordPlaceholder")}
          messages={parseErrorMessages(errors.oldPassword?.message, lang)}
        />
        <TextInput
          type="password"
          label={t("settings.account.newPassword")}
          {...register("newPassword")}
          placeholder={t("settings.account.newPasswordPlaceholder")}
          messages={parseErrorMessages(errors.newPassword?.message, lang)}
        />
        <TextInput
          type="password"
          label={t("settings.account.repeatPassword")}
          {...register("reNewPassword")}
          placeholder={t("settings.account.repeatPasswordPlaceholder")}
          messages={parseErrorMessages(errors.reNewPassword?.message, lang)}
        />
        {errors.root?.message && (
          <p className="text-sm text-validation-error-text mt-1">
            {parseErrorMessages(errors.root.message, lang)[0]?.text}
          </p>
        )}
      </div>
    </Modal>
  );
}
