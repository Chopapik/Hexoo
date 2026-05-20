import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase.database.types";

export type CommentRow = Tables<"comments">;
export type CommentUpdateRow = TablesUpdate<"comments">;
export type CommentReportInsertRow = TablesInsert<"comment_reports">;
export type DeleteCommentTxArgs =
  Database["public"]["Functions"]["delete_comment_tx"]["Args"];
