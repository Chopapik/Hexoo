import { supabaseAdmin } from "@/lib/supabaseServer";

const USERS_TABLE = "users";

export async function isUsernameTaken(username: string): Promise<boolean> {
  if (!username) return true;

  const normalized = username.trim().toLowerCase().replace(/\s+/g, "");
  const trimmed = username.trim();

  // Check name_lowercase (primary index for case-insensitive lookup)
  const { data: byLower } = await supabaseAdmin
    .from(USERS_TABLE)
    .select("uid")
    .eq("name_lowercase", normalized)
    .limit(1);

  if (byLower && byLower.length > 0) return true;

  // Check name exactly (for legacy or if name_lowercase was null)
  const { data: byName } = await supabaseAdmin
    .from(USERS_TABLE)
    .select("uid")
    .eq("name", trimmed)
    .limit(1);

  if (byName && byName.length > 0) return true;

  if (normalized !== trimmed) {
    const { data: byNameNorm } = await supabaseAdmin
      .from(USERS_TABLE)
      .select("uid")
      .eq("name", normalized)
      .limit(1);
    if (byNameNorm && byNameNorm.length > 0) return true;
  }

  return false;
}
