"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import Button from "@/features/shared/components/ui/Button";
import type { User } from "@/features/users/types/user.type";
import AdminUserEditModal from "./AdminUserEditModal";
import AdminUserCreateModal from "./AdminUserCreateModal";
import { formatDate } from "@/features/shared/utils/dateUtils";

type GetUsersResponse = {
  users: User[];
};

enum AdminModal {
  NONE,
  EDIT,
  CREATE,
}

export default function AllUsersList() {
  const [modal, setModal] = useState<AdminModal>(AdminModal.NONE);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openEditModal = (user: User) => {
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
  } = useQuery<User[], Error>({
    queryKey: ["admin", "allUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get<GetUsersResponse>("/admin/users");
      return res.data.users;
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

      <div className="w-full p-6 glass-card rounded-2xl border border-primary-neutral-stroke-default max-w-[1300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-Albert_Sans font-semibold">
              Wszyscy użytkownicy
            </h2>
            <div className="text-sm text-text-neutral">
              Przegląd kont w systemie
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              text={isFetching ? "Odświeżanie..." : "Odśwież"}
              size="sm"
            />
            <Button
              onClick={openCreateModal}
              text="+ Dodaj użytkownika"
              size="sm"
              variant="gradient-fuchsia"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-text-neutral">
            Ładowanie użytkowników…
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-red-500">
            Błąd podczas pobierania: {error?.message ?? "unknown"}
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm text-text-neutral flex gap-1">
              Razem:
              <span className="font-medium text-text-main">
                {users?.length ?? 0}
              </span>
            </div>

            <div className="overflow-x-auto rounded-md">
              <table className="min-w-full bg-transparent">
                <thead>
                  <tr className="text-left text-sm text-text-neutral">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nazwa</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Rola</th>
                    <th className="px-3 py-2">Utworzono</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Akcje</th>
                  </tr>
                </thead>

                <tbody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <tr
                        key={u.uid}
                        className="hover:bg-primary-neutral-background-default/50"
                      >
                        <td className="px-3 py-2 text-xs text-text-neutral truncate">
                          {u.uid}
                        </td>

                        <td className="px-3 py-2 text-text-main">
                          {u.name ?? "—"}
                        </td>

                        <td className="px-3 py-2 text-sm text-text-neutral">
                          {u.email ?? "—"}
                        </td>

                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-primary-neutral-stroke-default text-text-neutral">
                            {u.role ?? "user"}
                          </span>
                        </td>

                        <td className="px-3 py-2 text-sm text-text-neutral">
                          {formatDate(u.createdAt)}
                        </td>

                        <td className="px-3 py-2">
                          {u.isBanned ? (
                            <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-red-600 text-white">
                              ZBANOWANY
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
                            text="edytuj"
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-6 text-center text-text-neutral"
                      >
                        Brak użytkowników
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
