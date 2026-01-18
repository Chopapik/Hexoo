"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/features/shared/components/layout/Modal";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import adminCreateUser from "../hooks/user/useAdminCreateUser";
import type { UserRole } from "@/features/users/types/user.type";

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
    <div className="flex gap-3 justify-end w-full">
      <Button
        onClick={onClose}
        text="Anuluj"
        size="sm"
        variant="icon-fuchsia-ghost"
        disabled={isPending}
        className="text-text-neutral hover:text-white border-transparent"
      />
      <Button
        onClick={handleCreate}
        text="Utwórz konto"
        size="sm"
        variant="gradient-fuchsia"
        disabled={isPending || !email || !password}
        isLoading={isPending}
      />
    </div>
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
            options={[
              { value: "user", label: "Użytkownik" },
              { value: "moderator", label: "Moderator" },
              { value: "admin", label: "Administrator" },
            ]}
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
