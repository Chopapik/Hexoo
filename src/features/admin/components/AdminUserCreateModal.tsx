"use client";

import { useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import ModalFooter from "@/features/shared/components/layout/ModalFooter";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import adminCreateUser from "../hooks/user/useAdminCreateUser";
import type { UserRole } from "@/features/users/types/user.type";
import { USER_ROLE_OPTIONS } from "@/features/users/constants/userRoleOptions";

export default function AdminUserCreateModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  const { createUser, isPending } = adminCreateUser();

  const handleCreate = () => {
    if (!email || !password || !name) return;

    createUser({ name, email, password, role }, { onSuccess: () => onClose() });
  };

  const footer = (
    <ModalFooter
      cancelText="Anuluj"
      confirmText="Utwórz konto"
      onCancel={onClose}
      onConfirm={handleCreate}
      isPending={isPending}
      confirmSize="sm"
      cancelSize="sm"
      disabled={!email || !password || !name}
      className="[&_button:first-child]:text-text-neutral [&_button:first-child]:hover:text-white [&_button:first-child]:border-transparent"
    />
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Nowy użytkownik"
      footer={footer}
    >
      <div className="flex flex-col gap-5 py-2">
        <p className="text-sm text-text-neutral mb-2">
          Utwórz konto i skonfiguruj dostęp dla nowego użytkownika.
        </p>

        <div className="space-y-4">
          <TextInput
            label="Nazwa użytkownika"
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
            label="Rola"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={USER_ROLE_OPTIONS}
          />

          <TextInput
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showButton={true}
            placeholder="Wpisz hasło..."
          />
        </div>
      </div>
    </Modal>
  );
}
