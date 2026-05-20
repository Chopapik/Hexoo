import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase.database.types";

export type PostRow = Tables<"posts">;
export type PostInsertRow = TablesInsert<"posts">;
export type PostUpdateRow = TablesUpdate<"posts">;
export type PostReportInsertRow = TablesInsert<"post_reports">;
