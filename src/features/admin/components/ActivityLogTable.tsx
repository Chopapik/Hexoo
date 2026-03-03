"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import Button from "@/features/shared/components/ui/Button";

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

const PAGE_SIZE = 50;

export default function ActivityLogTable() {
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
      const last = lastPage[lastPage.length - 1];
      return last.createdAt;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const logs = data?.pages.flat() ?? [];

  return (
    <div className="w-full p-6 glass-card rounded-2xl border border-primary-neutral-stroke-default max-w-[1300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-Albert_Sans font-semibold">
            Log aktywności
          </h2>
          <div className="text-sm text-text-neutral">
            Ostatnie zdarzenia w systemie
          </div>
        </div>

        <Button
          onClick={() => refetch()}
          text="Odśwież"
          size="sm"
          isLoading={isFetching}
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-text-neutral">
          Ładowanie logów aktywności…
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
              {logs.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-md max-h-[600px] border border-primary-neutral-stroke-default/60">
            <table className="min-w-full bg-transparent text-sm">
              <thead className="bg-primary-neutral-background-default/60 sticky top-0 z-10">
                <tr className="text-left text-xs text-text-neutral uppercase tracking-wide">
                  <th className="px-3 py-2 w-[190px]">Czas</th>
                  <th className="px-3 py-2 w-[220px]">Użytkownik</th>
                  <th className="px-3 py-2 w-[220px]">Email</th>
                  <th className="px-3 py-2 w-[120px]">Rola</th>
                  <th className="px-3 py-2 w-[160px]">Akcja</th>
                  <th className="px-3 py-2">Szczegóły</th>
                </tr>
              </thead>

              <tbody>
                {logs && logs.length > 0 ? (
                  logs.map((log: ActivityLog) => (
                    <tr
                      key={log.id}
                      className="hover:bg-primary-neutral-background-default/60 border-t border-primary-neutral-stroke-default/40 align-top"
                    >
                      <td className="px-3 py-2 text-xs text-text-neutral whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("pl-PL", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2 text-xs text-text-main">
                        <div className="flex flex-col gap-0.5">
                          <span>{log.userName ?? "—"}</span>
                          <span className="font-mono text-[10px] text-text-neutral">
                            {log.userId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-text-neutral truncate max-w-[220px]">
                        {log.userEmail ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {log.userRole ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-neutral-background-default text-[11px] uppercase tracking-wide text-text-main border border-primary-neutral-stroke-default">
                            {log.userRole}
                          </span>
                        ) : (
                          <span className="text-text-neutral text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-neutral-background-default text-[11px] uppercase tracking-wide text-text-main border border-primary-neutral-stroke-default">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-text-main whitespace-pre-wrap max-w-[520px]">
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-text-neutral"
                    >
                      Brak zarejestrowanych zdarzeń
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => fetchNextPage()}
                text="Załaduj więcej"
                size="sm"
                isLoading={isFetchingNextPage}
                variant="secondary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
