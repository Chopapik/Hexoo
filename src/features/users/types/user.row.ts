import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase.database.types";

export type UserRow = Tables<"users">;
export type UserInsertRow = TablesInsert<"users">;
export type UserUpdateRow = TablesUpdate<"users">;
export type UserSummaryRow = Pick<UserRow, "avatar_meta" | "display_name" | "uid">;
