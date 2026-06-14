"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import Button from "@/features/shared/components/ui/Button";
import type { PrivateUserResponseDto } from "@/features/users/types/user.dto";
import AdminUserEditModal from "./AdminUserEditModal";
import AdminUserCreateModal from "./AdminUserCreateModal";
import { formatDate } from "@/features/shared/utils/dateUtils";
import { useI18n } from "@/i18n/useI18n";

type GetUsersResponse = {
  users: PrivateUserResponseDto[];
};

enum AdminModal {
  NONE,
  EDIT,
  CREATE,
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-600 text-white",
  moderator: "bg-yellow-500 text-white",
};

export default function AllUsersList() {
  const { lang, t } = useI18n();
  const [modal, setModal] = useState<AdminModal>(AdminModal.NONE);
  const [selectedUser, setSelectedUser] =
    useState<PrivateUserResponseDto | null>(null);

  const openEditModal = (user: PrivateUserResponseDto) => {
    setSelectedUser(user);
    setModal(AdminModal.EDIT);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setModal(AdminModal.CREATE);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModal(AdminModal.NONE);
  };

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PrivateUserResponseDto[], Error>({
    queryKey: ["admin", "allUsers"],
    queryFn: async () => {
      const res = await fetchClient.get<GetUsersResponse>("/admin/users");
      return res.users;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return (
    <>
      {modal === AdminModal.EDIT && selectedUser && (
        <AdminUserEditModal
          user={selectedUser}
          onClose={() => {
            closeModal();
            refetch();
          }}
        />
      )}

      {modal === AdminModal.CREATE && (
        <AdminUserCreateModal
          onClose={() => {
            closeModal();
            refetch();
          }}
        />
      )}

      <div className="w-full p-6 glass-card rounded-2xl border border-surface-card-border-default max-w-[1300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-sans font-semibold">
              {t("admin.allUsers")}
            </h2>
            <div className="text-sm text-foreground-secondary-default">
              {t("admin.accountsOverview")}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              text={t("common.refresh")}
              size="sm"
              isLoading={isFetching}
            />
            <Button
              onClick={openCreateModal}
              text={t("admin.addUser")}
              size="sm"
              variant="default"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-foreground-secondary-default">
            {t("admin.loadingUsers")}
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-red-500">
            {t("admin.fetchError", { message: error?.message ?? "unknown" })}
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm text-foreground-secondary-default flex gap-1">
              {t("admin.total")}
              <span className="font-medium text-foreground-primary-default">
                {users?.length ?? 0}
              </span>
            </div>

            <div className="overflow-x-auto rounded-md">
              <table className="min-w-full bg-transparent">
                <thead>
                  <tr className="text-left text-sm text-foreground-secondary-default">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">{t("admin.name")}</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">{t("admin.role")}</th>
                    <th className="px-3 py-2">{t("admin.created")}</th>
                    <th className="px-3 py-2">{t("admin.status")}</th>
                    <th className="px-3 py-2">{t("admin.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <tr
                        key={u.uid}
                        className="hover:bg-surface-card-background-default/50"
                      >
                        <td className="px-3 py-2 text-xs text-foreground-secondary-default truncate">
                          {u.uid}
                        </td>

                        <td className="px-3 py-2 text-foreground-primary-default">
                          {u.name ?? "—"}
                        </td>

                        <td className="px-3 py-2 text-sm text-foreground-secondary-default">
                          {u.email ?? "—"}
                        </td>

                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-xs ${
                              ROLE_STYLES[u.role ?? ""] ??
                              "bg-surface-card-border-default text-foreground-secondary-default"
                            }`}
                          >
                            {u.role ?? "user"}
                          </span>
                        </td>

                        <td className="px-3 py-2 text-sm text-foreground-secondary-default">
                          {formatDate(u.createdAt, undefined, lang)}
                        </td>

                        <td className="px-3 py-2">
                          {u.isBanned ? (
                            <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-red-600 text-white">
                              {t("admin.banned")}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-green-600 text-white">
                              OK
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <Button
                            onClick={() => openEditModal(u)}
                            variant="secondary"
                            text={t("admin.edit")}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-foreground-secondary-default"
                      >
                        {t("admin.noUsers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
