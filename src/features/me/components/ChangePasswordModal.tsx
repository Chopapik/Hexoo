"use client";

import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import Modal from "@/features/shared/components/layout/Modal";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
import useUpdatePasswordForm from "../hooks/useUpdatePasswordForm";
import { parseErrorMessages } from "../utils/UpdatePasswordFormValidation";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
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
    <div className="flex gap-3 justify-end w-full">
      <Button
        onClick={onClose}
        text="Anuluj"
        size="sm"
        variant="icon-fuchsia-ghost"
        disabled={isPending}
      />
      <Button
        onClick={onSubmit}
        text={isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        size="sm"
        variant="gradient-fuchsia"
        disabled={isPending}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zmiana hasła"
      footer={footerContent}
    >
      <div className="flex flex-col gap-4 pt-2">
        <TextInput
          type="password"
          label="Aktualne hasło"
          {...register("oldPassword")}
          placeholder="Wpisz swoje aktualne hasło"
          messages={parseErrorMessages(errors.oldPassword?.message)}
        />
        <TextInput
          type="password"
          label="Nowe hasło"
          {...register("newPassword")}
          placeholder="Minimum 8 znaków"
          messages={parseErrorMessages(errors.newPassword?.message)}
        />
        <TextInput
          type="password"
          label="Powtórz nowe hasło"
          {...register("reNewPassword")}
          placeholder="Potwierdź nowe hasło"
          messages={parseErrorMessages(errors.reNewPassword?.message)}
        />
        {errors.root?.message && (
          <p className="text-sm text-red-400 mt-1">
            {parseErrorMessages(errors.root.message)[0]?.text}
          </p>
        )}
      </div>
    </Modal>
  );
}
