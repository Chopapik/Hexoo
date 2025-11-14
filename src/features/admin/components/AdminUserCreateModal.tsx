"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import useCreateUser from "../hooks/user/useCreateUser";
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

  const { createUser, isPending } = useCreateUser();

  const handleCreate = () => {
    if (!email || !password || !name) return;

    createUser(
      {
        name,
        email,
        password,
        role,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="relative w-[560px] rounded-2xl p-6 shadow-lg border border-primary-neutral-stroke-default
                   glass-card backdrop-blur-md"
      >
        <h2 className="text-2xl font-Albert_Sans font-semibold mb-4 text-text-main">
          Utwórz nowego użytkownika
        </h2>

        <div className="flex flex-col gap-5">
          <div className="bg-white/5 p-4 rounded-lg border border-primary-neutral-background-default/30">
            <h3 className="text-lg font-medium mb-3 text-text-main">
              Dane użytkownika
            </h3>

            <div className="flex flex-col gap-3">
              <TextInput
                label="Nazwa użytkownika"
                value={name}
                onChange={(e) => setName(e.target.value)}
                showButton={false}
              />

              <TextInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                showButton={false}
              />

              <TextInput
                label="Hasło"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showButton={true}
              />

              <label className="text-sm text-text-neutral">Rola</label>
              <select
                className="p-3 rounded-md bg-white w-full"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="user">Użytkownik</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end w-full">
            <Button
              onClick={onClose}
              text="Anuluj"
              size="sm"
              variant="icon-fuchsia-ghost"
              disabled={isPending}
            />

            <Button
              onClick={handleCreate}
              text={isPending ? "Tworzenie..." : "Utwórz"}
              size="sm"
              variant="gradient-fuchsia"
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
