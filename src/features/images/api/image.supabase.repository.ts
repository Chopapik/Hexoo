import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  ImageStorageRepository,
  ImageStorageUploadResult,
} from "./imageStorage.repository.interface";

const storageFrom = (bucket: string) => supabaseAdmin.storage.from(bucket);

export class SupabaseImageStorageRepository implements ImageStorageRepository {
  async uploadObject(
    bucket: string,
    objectKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<ImageStorageUploadResult> {
    const storage = storageFrom(bucket);

    const { error: uploadError } = await storage.upload(objectKey, buffer, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = storage.getPublicUrl(objectKey);
    const publicUrl = data.publicUrl;

    return {
      publicUrl,
      objectKey,
      contentType,
      sizeBytes: buffer.length,
    };
  }

  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    const storage = storageFrom(bucket);

    const { error } = await storage.remove([objectKey]);

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
