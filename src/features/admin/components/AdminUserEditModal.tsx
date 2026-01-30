"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/features/shared/components/layout/Modal";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import type { PrivateUserResponseDto } from "@/features/users/types/user.dto";
import type { UserRole } from "@/features/users/types/user.type";
import type { UpdateUserDto } from "@/features/users/types/user.dto";
import useAdminUpdateUserAccount from "../hooks/user/useAdminUpdateUserAccount";
import useAdminUpdateUserPassword from "../hooks/user/useAdminUpdateUserPassword";
import useBlockUser from "../hooks/user/useBlockUser";
import useUnblockUser from "../hooks/user/useUnblockUser";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import useAdminDeleteUser from "../hooks/user/useAdminDeleteUser";
import { formatDate } from "@/features/shared/utils/dateUtils";
import { USER_ROLE_OPTIONS } from "@/features/users/constants/userRoleOptions";

export default function AdminUserEditModal({
  user,
  onClose,
}: {
  user: PrivateUserResponseDto | null;
  onClose: () => void;
}) {
  const [newUserData, setNewUserData] = useState<Partial<UpdateUserDto>>({
    name: "",
    role: undefined,
  });

  const [newPassword, setNewPassword] = useState<string>("");
  const { adminUpdateUserAccount, isPending: isUpdatingData } =
    useAdminUpdateUserAccount();
  const { adminUpdateUserPassword, isPending: isUpdatingPassword } =
    useAdminUpdateUserPassword();

  const { blockUser, isPending: isBlockingUser } = useBlockUser();
  const { unBlockUser, isPending: isUnblockingUser } = useUnblockUser();
  const { adminDeleteUser, isPending: isDeletingUser } = useAdminDeleteUser();

  useEffect(() => {
    if (user) {
      setNewUserData({
        name: user.name,
        role: user.role as UserRole,
      });
      setNewPassword("");
    }
  }, [user]);

  const handleFieldChange = (
    field: keyof UpdateUserDto,
    value: string | UserRole,
  ) => {
    setNewUserData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  if (!user) return null;

  const displayRole = newUserData.role || user.role || "user";
  const displayName = newUserData.name || user.name;

  const footer = (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      <Button
        onClick={onClose}
        text="Anuluj i zamknij"
        disabled={isUpdatingData || isUpdatingPassword}
        className="text-text-neutral hover:text-white order-2 md:order-1 border-transparent"
        variant="secondary"
        size="sm"
      />

      <div className="flex gap-3 w-full md:w-auto order-1 md:order-2 justify-end">
        {user.isBanned ? (
          <Button
            onClick={() => unBlockUser({ uid: user.uid })}
            text="Odblokuj konto"
            size="sm"
            variant="success"
            disabled={isUnblockingUser}
            isLoading={isUnblockingUser}
          />
        ) : (
          <Button
            onClick={() => blockUser({ uid: user.uid })}
            text="Zablokuj konto"
            size="sm"
            variant="warning"
            disabled={isBlockingUser}
            isLoading={isBlockingUser}
          />
        )}

        <Button
          onClick={() => adminDeleteUser(user.uid)}
          text="Usuń użytkownika"
          size="sm"
          variant="danger"
          disabled={isUpdatingData}
          isLoading={isDeletingUser}
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edycja użytkownika"
      className="max-w-3xl"
      footer={footer}
    >
      <div className="flex flex-col gap-6 p-1">
        {/* User Summary Card */}
        <div className="mb-8 p-5 rounded-xl border border-primary-neutral-stroke-default bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <Image
                src={user.avatarUrl || defaultAvatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-2xl border border-white/10 shadow-lg object-cover w-20 h-20 sm:w-24 sm:h-24"
              />
              <div
                className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-black/20 ${
                  user.isBanned
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {user.isBanned ? "Zbanowany" : "Aktywny"}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-text-main font-Albert_Sans truncate">
                  {displayName}
                </h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-primary-neutral-stroke-default text-text-neutral mb-1.5">
                  {displayRole}
                </span>
              </div>

              <p className="text-text-neutral text-sm mb-3 font-mono">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-text-neutral/70 border-t border-white/5 pt-3">
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    ID Użytkownika
                  </span>
                  <span className="font-mono text-text-neutral select-all">
                    {user.uid}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    Dołączył
                  </span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Data */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-text-main flex items-center gap-2">
                Dane profilowe
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label="Nazwa wyświetlana"
                  value={newUserData.name ?? ""}
                  placeholder={user.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  showButton={false}
                />

                <Select
                  label="Rola w systemie"
                  value={newUserData.role ?? ""}
                  onChange={(e) =>
                    handleFieldChange("role", e.target.value as UserRole)
                  }
                  options={USER_ROLE_OPTIONS}
                  placeholder="— Wybierz rolę —"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserAccount({ uid: user.uid, data: newUserData })
                  }
                  text="Zapisz zmiany"
                  size="sm"
                  variant="default"
                  disabled={isUpdatingData}
                  isLoading={isUpdatingData}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-5 rounded-xl border border-primary-neutral-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-text-main flex items-center gap-2">
                Bezpieczeństwo
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label="Ustaw nowe hasło"
                  value={newPassword}
                  placeholder="Min. 8 znaków"
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  showButton={true}
                />
                <p className="text-xs text-text-neutral/60">
                  Pozostaw puste, jeśli nie chcesz zmieniać hasła użytkownika.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserPassword({
                      uid: user.uid,
                      newPassword: newPassword,
                    })
                  }
                  text="Zmień hasło"
                  size="sm"
                  variant="default"
                  disabled={isUpdatingPassword || !newPassword}
                  isLoading={isUpdatingPassword}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
