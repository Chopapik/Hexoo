import { useQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";

export type PreviewUser = {
  uid: string;
  name: string;
  avatarUrl?: string;
};

export function useActiveUsers(uids: string[]) {
  return useQuery<PreviewUser[]>({
    queryKey: ["users", "byIds", uids.join(",")],
    enabled: uids.length > 1,
    staleTime: 1000 * 60,
    queryFn: async ({ signal }) => {
      const data = await fetchClient.post<{ users: PreviewUser[] }>(
        "/users/by-ids",
        { uids },
        { signal },
      );

      return data.users ?? [];
    },
  });
}
