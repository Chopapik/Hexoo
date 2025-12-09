"use client";

import { useState } from "react";
import TextInput from "@/features/shared/components/ui/TextInput";
import Button from "@/features/shared/components/ui/Button";
import useAdminDeleteUser from "../hooks/user/useAdminCreateUser";
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

  const { createUser, isPending } = useAdminDeleteUser();

  const handleCreate = () => {
    if (!email || !password || !name) return;

    createUser({ name, email, password, role }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[560px] rounded-2xl p-8 shadow-2xl border border-primary-neutral-stroke-default
                   glass-card backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-Albert_Sans font-bold text-text-main">
              Nowy użytkownik
            </h2>
            <p className="text-sm text-text-neutral mt-1">
              Utwórz konto i skonfiguruj dostęp.
            </p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-text-neutral">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-5">
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
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm text-text-neutral font-semibold font-Plus_Jakarta_Sans ml-1">
                Rola
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 px-4 appearance-none bg-white/5 border border-primary-neutral-stroke-default rounded-lg 
                             text-text-main focus:outline-none focus:border-text-neutral/50 transition-all font-Plus_Jakarta_Sans cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="user" className="bg-neutral-900">
                    Użytkownik
                  </option>
                  <option value="moderator" className="bg-neutral-900">
                    Moderator
                  </option>
                  <option value="admin" className="bg-neutral-900">
                    Administrator
                  </option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-neutral">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <TextInput
                    label="Hasło"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showButton={false}
                    placeholder="Wpisz hasło..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-white/10 flex gap-3 justify-end w-full">
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
              text={isPending ? "Tworzenie..." : "Utwórz konto"}
              size="sm"
              variant="gradient-fuchsia"
              disabled={isPending || !email || !password}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
