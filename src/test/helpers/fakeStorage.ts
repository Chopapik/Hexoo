import type {
  ImageStorageRepository,
  ImageStorageUploadResult,
} from "@/features/images/api/imageStorage.repository.interface";

type StorageOperation = "uploadObject" | "deleteObject" | "getPublicUrl";

export type FakeStorageCall =
  | {
      operation: "uploadObject";
      bucket: string;
      objectKey: string;
      contentType: string;
      sizeBytes: number;
    }
  | { operation: "deleteObject"; bucket: string; objectKey: string }
  | { operation: "getPublicUrl"; bucket: string; objectKey: string };

type StoredObject = {
  bucket: string;
  objectKey: string;
  buffer: Buffer;
  contentType: string;
};

export class FakeStorage implements ImageStorageRepository {
  private objects = new Map<string, StoredObject>();
  private failures = new Map<StorageOperation, Error>();
  public readonly calls: FakeStorageCall[] = [];

  async uploadObject(
    bucket: string,
    objectKey: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<ImageStorageUploadResult> {
    this.calls.push({
      operation: "uploadObject",
      bucket,
      objectKey,
      contentType,
      sizeBytes: buffer.byteLength,
    });
    this.throwIfFailed("uploadObject");

    this.objects.set(this.storageKey(bucket, objectKey), {
      bucket,
      objectKey,
      buffer: Buffer.from(buffer),
      contentType,
    });

    return {
      publicUrl: this.publicUrl(bucket, objectKey),
      objectKey,
      contentType,
      sizeBytes: buffer.byteLength,
    };
  }

  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    this.calls.push({ operation: "deleteObject", bucket, objectKey });
    this.throwIfFailed("deleteObject");
    this.objects.delete(this.storageKey(bucket, objectKey));
  }

  getObject(bucket: string, objectKey: string): StoredObject | undefined {
    const object = this.objects.get(this.storageKey(bucket, objectKey));
    return object
      ? {
          ...object,
          buffer: Buffer.from(object.buffer),
        }
      : undefined;
  }

  getPublicUrl(bucket: string, objectKey: string): string {
    this.calls.push({ operation: "getPublicUrl", bucket, objectKey });
    this.throwIfFailed("getPublicUrl");
    return this.publicUrl(bucket, objectKey);
  }

  failNext(operation: StorageOperation, error = new Error(operation)): void {
    this.failures.set(operation, error);
  }

  reset(): void {
    this.objects.clear();
    this.failures.clear();
    this.calls.length = 0;
  }

  private storageKey(bucket: string, objectKey: string): string {
    return `${bucket}/${objectKey}`;
  }

  private publicUrl(bucket: string, objectKey: string): string {
    return `https://storage.example.test/${encodeURIComponent(bucket)}/${encodeURIComponent(objectKey)}`;
  }

  private throwIfFailed(operation: StorageOperation): void {
    const error = this.failures.get(operation);
    if (!error) return;

    this.failures.delete(operation);
    throw error;
  }
}
