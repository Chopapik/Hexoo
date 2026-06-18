"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/features/shared/components/layout/Modal";
import TextInput from "@/features/shared/components/ui/TextInput";
import Select from "@/features/shared/components/ui/Select";
import Button from "@/features/shared/components/ui/Button";
import type { PrivateUserResponseDto } from "@/features/users/types/user.dto";
import type { UserRole } from "@/features/users/types/user.type";
import type { UpdateUserRequestDto } from "@/features/users/types/user.dto";
import useAdminUpdateUserAccount from "../hooks/user/useAdminUpdateUserAccount";
import useAdminUpdateUserPassword from "../hooks/user/useAdminUpdateUserPassword";
import useBlockUser from "../hooks/user/useBlockUser";
import useUnblockUser from "../hooks/user/useUnblockUser";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import useAdminDeleteUser from "../hooks/user/useAdminDeleteUser";
import { formatDate } from "@/features/shared/utils/dateUtils";
import { USER_ROLE_OPTIONS } from "@/features/users/constants/userRoleOptions";
import { useI18n } from "@/i18n/useI18n";

export default function AdminUserEditModal({
  user,
  onClose,
}: {
  user: PrivateUserResponseDto | null;
  onClose: () => void;
}) {
  if (!user) return null;

  return (
    <AdminUserEditModalContent
      key={`${user.uid}:${user.name}:${user.role}`}
      user={user}
      onClose={onClose}
    />
  );
}

function AdminUserEditModalContent({
  user,
  onClose,
}: {
  user: PrivateUserResponseDto;
  onClose: () => void;
}) {
  const { lang, t } = useI18n();
  const [newUserData, setNewUserData] = useState<Partial<UpdateUserRequestDto>>(
    {
      name: user.name,
      role: user.role as UserRole,
    },
  );

  const [newPassword, setNewPassword] = useState<string>("");
  const [blockReason, setBlockReason] = useState<string>("");
  const { adminUpdateUserAccount, isPending: isUpdatingData } =
    useAdminUpdateUserAccount();
  const { adminUpdateUserPassword, isPending: isUpdatingPassword } =
    useAdminUpdateUserPassword();

  const { blockUser, isPending: isBlockingUser } = useBlockUser();
  const { unBlockUser, isPending: isUnblockingUser } = useUnblockUser();
  const { adminDeleteUser, isPending: isDeletingUser } = useAdminDeleteUser();

  const handleFieldChange = (
    field: keyof UpdateUserRequestDto,
    value: string | UserRole,
  ) => {
    setNewUserData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const displayRole = newUserData.role || user.role || "user";
  const displayName = newUserData.name || user.name;
  const trimmedBlockReason = blockReason.trim();

  const footer = (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      <Button
        onClick={onClose}
        text={t("admin.cancelClose")}
        disabled={isUpdatingData || isUpdatingPassword}
        className="text-foreground-secondary-default hover:text-foreground-primary-default order-2 md:order-1 border-transparent"
        variant="secondary"
        size="sm"
      />

      <div className="flex gap-3 w-full md:w-auto order-1 md:order-2 justify-end">
        {user.isBanned ? (
          <Button
            onClick={() => unBlockUser({ uid: user.uid })}
            text={t("admin.unblockAccount")}
            size="sm"
            variant="success"
            disabled={isUnblockingUser}
            isLoading={isUnblockingUser}
          />
        ) : (
          <Button
            onClick={() =>
              blockUser({ uid: user.uid, reason: trimmedBlockReason })
            }
            text={t("admin.blockAccount")}
            size="sm"
            variant="warning"
            disabled={isBlockingUser || !trimmedBlockReason}
            isLoading={isBlockingUser}
          />
        )}

        <Button
          onClick={() => adminDeleteUser(user.uid)}
          text={t("admin.deleteUser")}
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
      title={t("admin.editUser")}
      className="max-w-3xl"
      footer={footer}
    >
      <div className="flex flex-col gap-6 p-1">
        {/* User Summary Card */}
        <div className="mb-8 p-5 rounded-xl border border-surface-card-border-default bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <Image
                src={user.avatarUrl || defaultAvatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-2xl border border-modal-surface-border-default shadow-lg object-cover w-20 h-20 sm:w-24 sm:h-24"
              />
              <div
                className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-divider-default ${
                  user.isBanned
                    ? "bg-button-danger-background-default-from text-foreground-primary-default"
                    : "bg-button-success-background-default-from text-foreground-primary-default"
                }`}
              >
                {user.isBanned ? t("admin.bannedLabel") : t("admin.activeLabel")}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground-primary-default font-sans truncate">
                  {displayName}
                </h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-surface-card-border-default text-foreground-secondary-default mb-1.5">
                  {displayRole}
                </span>
              </div>

              <p className="text-foreground-secondary-default text-sm mb-3 font-mono">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-foreground-secondary-default/70 border-t border-divider-subtle pt-3">
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    {t("admin.userId")}
                  </span>
                  <span className="font-mono text-foreground-secondary-default select-all">
                    {user.uid}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] font-semibold tracking-wider opacity-50">
                    {t("admin.joined")}
                  </span>
                  <span>{formatDate(user.createdAt, undefined, lang)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Data */}
          <div className="flex flex-col gap-4">
            <div className="bg-modal-surface-background-default p-5 rounded-xl border border-surface-card-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-foreground-primary-default flex items-center gap-2">
                {t("admin.profileData")}
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label={t("admin.displayName")}
                  value={newUserData.name ?? ""}
                  placeholder={user.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  showButton={false}
                />

                <Select
                  label={t("admin.systemRole")}
                  value={newUserData.role ?? ""}
                  onChange={(e) =>
                    handleFieldChange("role", e.target.value as UserRole)
                  }
                  options={USER_ROLE_OPTIONS}
                  placeholder={t("admin.selectRole")}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserAccount({ uid: user.uid, data: newUserData })
                  }
                  text={t("common.saveChanges")}
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
            <div className="bg-modal-surface-background-default p-5 rounded-xl border border-surface-card-background-default/30 h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 text-foreground-primary-default flex items-center gap-2">
                {t("admin.security")}
              </h3>

              <div className="flex flex-col gap-4 flex-1">
                <TextInput
                  label={t("admin.setNewPassword")}
                  value={newPassword}
                  placeholder={t("settings.account.newPasswordPlaceholder")}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  showButton={true}
                />
                <p className="text-xs text-foreground-secondary-default/60">
                  {t("admin.passwordHelp")}
                </p>
                {!user.isBanned && (
                  <TextInput
                    label="Powód blokady"
                    value={blockReason}
                    placeholder="Wpisz powód blokady"
                    onChange={(e) => setBlockReason(e.target.value)}
                    showButton={false}
                  />
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() =>
                    adminUpdateUserPassword({
                      uid: user.uid,
                      newPassword: newPassword,
                    })
                  }
                  text={t("admin.changePassword")}
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
