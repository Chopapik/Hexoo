import { supabaseAdmin } from "@/lib/supabaseServer";
import type { Tables } from "@/lib/supabase.database.types";

type DbError = {
  message?: string | null;
} | null | undefined;

type CursorPaginationTable = "activity_logs" | "comments" | "posts";

type CursorRow = Pick<Tables<CursorPaginationTable>, "created_at" | "id">;

type CursorFilterQuery<TQuery> = {
  or(filters: string): TQuery;
};

export function throwDbError(error: DbError): asserts error is null | undefined {
  if (error) {
    throw new Error(error.message ?? "Database error");
  }
}

export async function applyCursorPagination<
  TQuery extends CursorFilterQuery<TQuery>,
>(
  query: TQuery,
  table: CursorPaginationTable,
  startAfterId?: string,
): Promise<void> {
  if (!startAfterId) return;

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("created_at, id")
    .eq("id", startAfterId)
    .maybeSingle();

  throwDbError(error);

  const cursor = data as CursorRow | null;
  if (!cursor) return;

  query.or(
    `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
  );
}
