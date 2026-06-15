"use client";

import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import Button from "@/features/shared/components/ui/Button";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";
import { useI18n } from "@/i18n/useI18n";

type ActivityLog = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  details: string;
  createdAt: string;
};

type GetActivityLogsResponse = {
  logs: ActivityLog[];
};

const PAGE_SIZE = 20;

export default function ActivityLogTable() {
  const { lang, t } = useI18n();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ActivityLog[], Error>({
    queryKey: ["admin", "activityLogs"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
      });

      if (pageParam) {
        params.append("startAfter", pageParam as string);
      }

      const res = await fetchClient.get<GetActivityLogsResponse>(
        `/admin/activity-logs?${params.toString()}`,
      );

      return res.logs;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const logs = data?.pages.flat() ?? [];
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRootRef.current;
    const target = observerTarget.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, threshold: 1.0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages.length]);

  return (
    <div className="glass-card w-full p-6 border border-surface-card-border-default rounded-2xl max-w-[1300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-sans font-semibold">
            {t("admin.activityLog")}
          </h2>
          <div className="text-sm text-foreground-secondary-default">
            {t("admin.latestEvents")}
          </div>
        </div>

        <Button
          onClick={() => refetch()}
          text={t("common.refresh")}
          size="sm"
          isLoading={isFetching}
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-foreground-secondary-default">
          {t("admin.loadingLogs")}
        </div>
      ) : isError ? (
        <div className="py-6 text-center text-validation-error-text">
          {t("admin.fetchError", { message: error?.message ?? "unknown" })}
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-foreground-secondary-default flex gap-1">
            {t("admin.loaded")}
            <span className="font-medium text-foreground-primary-default">{logs.length}</span>
          </div>

          <div
            ref={scrollRootRef}
            className="overflow-x-auto overflow-y-auto rounded-md max-h-[600px] border border-surface-card-border-default/60"
          >
            <table className="min-w-full bg-transparent text-sm">
              <thead className="bg-surface-card-background-default/60 sticky top-0 z-10">
                <tr className="text-left text-xs text-foreground-secondary-default uppercase tracking-wide">
                  <th className="px-3 py-2 w-[190px]">{t("admin.time")}</th>
                  <th className="px-3 py-2 w-[220px]">{t("admin.user")}</th>
                  <th className="px-3 py-2 w-[220px]">Email</th>
                  <th className="px-3 py-2 w-[120px]">{t("admin.role")}</th>
                  <th className="px-3 py-2 w-[160px]">{t("admin.action")}</th>
                  <th className="px-3 py-2">{t("admin.details")}</th>
                </tr>
              </thead>

              <tbody>
                {logs && logs.length > 0 ? (
                  logs.map((log: ActivityLog) => (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-card-background-default/60 border-t border-surface-card-border-default/40 align-top"
                    >
                      <td className="px-3 py-2 text-xs text-foreground-secondary-default whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(lang === "pl" ? "pl-PL" : "en-US", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground-primary-default">
                        <div className="flex flex-col gap-0.5">
                          <span>{log.userName ?? "—"}</span>
                          <span className="font-mono text-[10px] text-foreground-secondary-default">
                            {log.userId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground-secondary-default truncate max-w-[220px]">
                        {log.userEmail ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {log.userRole ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-card-background-default text-[11px] uppercase tracking-wide text-foreground-primary-default border border-surface-card-border-default">
                            {log.userRole}
                          </span>
                        ) : (
                          <span className="text-foreground-secondary-default text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-card-background-default text-[11px] uppercase tracking-wide text-foreground-primary-default border border-surface-card-border-default">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground-primary-default whitespace-pre-wrap max-w-[520px]">
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-foreground-secondary-default"
                    >
                      {t("admin.noEvents")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {logs.length > 0 && (
              <div
                ref={observerTarget}
                className="h-4 w-full flex justify-center py-4 shrink-0"
              >
                {isFetchingNextPage && (
                  <AppLoader size="lg" className="text-foreground-secondary-default" />
                )}
              </div>
            )}
          </div>

          {!hasNextPage && logs.length > 0 && (
            <div className="text-center text-foreground-secondary-default text-sm py-6 font-sans opacity-50">
              {t("admin.allLoaded")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
