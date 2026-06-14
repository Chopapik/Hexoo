"use client";

import { useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import adminCreateUser from "../hooks/user/useAdminCreateUser";
import type { UserRole } from "@/features/users/types/user.type";
import { USER_ROLE_OPTIONS } from "@/features/users/constants/userRoleOptions";
import { useI18n } from "@/i18n/useI18n";

export default function AdminUserCreateModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLE_OPTIONS[0].value);

  const { createUser, isPending } = adminCreateUser();

  const handleCreate = () => {
    if (!email || !password || !name) return;

    createUser({ name, email, password, role }, { onSuccess: () => onClose() });
  };

  const footer = (
    <ModalFooter
      cancelText={t("common.cancel")}
      confirmText={t("admin.createAccount")}
      onCancel={onClose}
      onConfirm={handleCreate}
      isPending={isPending}
      confirmSize="sm"
      cancelSize="sm"
      disabled={!email || !password || !name}
      className="[&_button:first-child]:text-foreground-secondary-default [&_button:first-child]:hover:text-foreground-primary-default [&_button:first-child]:border-transparent"
    />
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("admin.newUser")}
      footer={footer}
    >
      <div className="flex flex-col gap-5 py-2">
        <p className="text-sm text-foreground-secondary-default mb-2">
          {t("admin.createCopy")}
        </p>

        <div className="space-y-4">
          <TextInput
            label={t("auth.register.username")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            showButton={false}
            placeholder="np. JanKowalski"
          />

          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            showButton={false}
            placeholder="np. jan@hexoo.com"
          />

          <Select
            label={t("admin.role")}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={USER_ROLE_OPTIONS}
          />

          <TextInput
            label={t("auth.register.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showButton={true}
            placeholder={t("admin.passwordPlaceholder")}
          />
        </div>
      </div>
    </Modal>
  );
}
