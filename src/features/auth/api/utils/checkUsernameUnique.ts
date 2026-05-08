import { supabaseAdmin } from "@/lib/supabaseServer";
import { normalizeDisplayName } from "@/features/users/utils/displayName";

const USERS_TABLE = "users";

// Checks display_name uniqueness until a separate handle/username field exists.
export async function isUsernameTaken(
  username: string,
  exceptUid?: string,
): Promise<boolean> {
  const normalized = normalizeDisplayName(username);

  if (!normalized) return false;

  const { data, error } = await supabaseAdmin
    .from(USERS_TABLE)
    .select("uid")
    .eq("display_name_normalized", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "Database error");
  }

  if (!data) return false;

  if (exceptUid && data.uid === exceptUid) {
    return false;
  }

  return true;
}
