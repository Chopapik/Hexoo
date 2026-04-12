import { supabaseAdmin } from "@/lib/supabaseServer";
import type { ImageMeta } from "../types/image.type";
import { buildObjectKey } from "./imageMeta";

/** Public URL derived only from ImageMeta (bucket + object key). */
export function resolveImagePublicUrl(
  meta: ImageMeta | null | undefined,
): string | null {
  if (!meta) return null;
  const { data } = supabaseAdmin.storage
    .from(meta.storageBucket)
    .getPublicUrl(buildObjectKey(meta));
  return data.publicUrl;
}
