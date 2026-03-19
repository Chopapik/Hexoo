import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  ImageStorageRepository,
  ImageStorageUploadResult,
} from "./imageStorage.repository.interface";

const getStorageClient = () => {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "[ImageStorageRepository] Storage bucket is not configured"
    );
  }

  return supabaseAdmin.storage.from(bucketName);
};

export class SupabaseImageStorageRepository implements ImageStorageRepository {
  async uploadObject(
    storagePath: string,
    buffer: Buffer,
    contentType: string
  ): Promise<ImageStorageUploadResult> {
    const storage = getStorageClient();

    const { error: uploadError } = await storage.upload(storagePath, buffer, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = storage.getPublicUrl(storagePath);
    const publicUrl = data.publicUrl;

    return {
      publicUrl,
      storagePath,
      contentType,
      sizeBytes: buffer.length,
    };
  }

  async deleteObject(storagePath: string): Promise<void> {
    const storage = getStorageClient();

    const { error } = await storage.remove([storagePath]);

    if (error) {
      const statusCode =
        "status" in error && typeof error.status === "number"
          ? error.status
          : null;
      if (statusCode === 404) {
        return;
      }
      throw error;
    }
  }
}

