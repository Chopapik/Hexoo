import { NextRequest } from "next/server";
import { createAppError } from "@/lib/AppError";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import { getUsersByIds } from "@/features/users/api/services";

const MAX_UIDS = 40;

type PublicUserPreview = {
  uid: string;
  name: string;
  avatarUrl?: string;
};

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = (await request.json()) as { uids?: unknown };
  const raw = body?.uids;

  if (!Array.isArray(raw)) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[users/by-ids] Body must include uids: string[].",
    });
  }

  const uids = [
    ...new Set(
      raw.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      ),
    ),
  ].slice(0, MAX_UIDS);

  if (uids.length === 0) {
    return handleSuccess({ users: [] as Array<PublicUserPreview> });
  }

  const map = await getUsersByIds(uids);
  const users: PublicUserPreview[] = [];

  for (const uid of uids) {
    const row = map[uid];
    if (!row?.name?.trim()) continue;
    users.push({
      uid,
      name: row.name,
      avatarUrl: resolveImagePublicUrl(row.avatarMeta) ?? undefined,
    });
  }

  return handleSuccess({ users });
});
