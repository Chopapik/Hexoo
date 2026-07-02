import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageUploadResult } from "@/features/images/api/imageService.interface";
import type { PreparedImageUpload } from "@/features/images/api/image-resource-limits";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { PostContentService } from "../post.content.service";

vi.mock("@/features/images/api/image.service", () => ({
  hasFile: (file: unknown) =>
    !!file &&
    typeof file === "object" &&
    "size" in file &&
    typeof (file as { size: unknown }).size === "number" &&
    (file as { size: number }).size > 0,
  prepareImage: vi.fn(),
  uploadPreparedImage: vi.fn(),
}));

vi.mock("@/features/moderation/utils/assessSafety", () => ({
  performModeration: vi.fn(),
}));

type ImagePreparer = NonNullable<
  ConstructorParameters<typeof PostContentService>[0]
>;
type ImageUploader = NonNullable<
  ConstructorParameters<typeof PostContentService>[1]
>;
type Moderator = NonNullable<
  ConstructorParameters<typeof PostContentService>[2]
>;
type ModerationResult = Awaited<ReturnType<Moderator>>;

const imageFile = {
  name: "post.png",
  type: "image/png",
  size: 128,
} as File;

const preparedImage: PreparedImageUpload = {
  file: imageFile,
  inputBuffer: Buffer.from("prepared-image"),
  metadata: {
    width: 100,
    height: 100,
    pages: 1,
  },
};

const uploadResult: ImageUploadResult = {
  storageBucket: "post-images",
  storageLocation: "posts/user-1",
  fileName: "post.webp",
  downloadToken: "download-token",
  contentType: "image/webp",
  sizeBytes: 12345,
  publicUrl: "https://cdn.example.com/post.webp",
};

const approvedModeration: ModerationResult = {
  moderationStatus: ModerationStatus.Approved,
  flaggedReasons: [],
  flaggedSource: [],
  moderationEvidence: [],
  isNSFW: false,
  isPending: false,
  moderationLogPayloadForResource: undefined,
};

const pendingModeration: ModerationResult = {
  moderationStatus: ModerationStatus.Pending,
  flaggedReasons: ["violence"],
  flaggedSource: ["text"],
  moderationEvidence: [
    {
      category: "violence",
      score: 0.95,
      sources: ["text"],
    },
  ],
  isNSFW: true,
  isPending: true,
  moderationLogPayloadForResource: {
    userId: "user-1",
    verdict: ModerationStatus.Pending,
    categories: ["violence"],
    actionTaken: "FLAGGED_FOR_REVIEW",
    source: "ai",
    actorId: "system",
    reasonSummary: "AI moderation result: pending",
    reasonDetails: "Categories: violence.",
  },
};

describe("PostContentService", () => {
  let imagePreparer: ImagePreparer;
  let imageUploader: ImageUploader;
  let moderator: Moderator;
  let service: PostContentService;

  beforeEach(() => {
    vi.clearAllMocks();

    imagePreparer = vi.fn<ImagePreparer>().mockResolvedValue(preparedImage);
    imageUploader = vi.fn<ImageUploader>().mockResolvedValue(uploadResult);
    moderator = vi.fn<Moderator>().mockResolvedValue(approvedModeration);
    service = new PostContentService(imagePreparer, imageUploader, moderator);
  });

  it("does not prepare or upload an image when no image file is provided", async () => {
    await service.process("user-1", "Post text", "posts", null);

    expect(imagePreparer).not.toHaveBeenCalled();
    expect(imageUploader).not.toHaveBeenCalled();
  });

  it("still runs moderation when no image file is provided", async () => {
    const result = await service.process("user-1", "Post text", "posts", null);

    expect(moderator).toHaveBeenCalledWith("user-1", "Post text", null);
    expect(result).toEqual(approvedModeration);
  });

  it("prepares an image before upload when an image file is provided", async () => {
    await service.process("user-1", "Post text", "posts", imageFile);

    expect(imagePreparer).toHaveBeenCalledWith(imageFile);
    expect(imageUploader).toHaveBeenCalledWith(
      preparedImage,
      "user-1",
      "posts",
    );
    expect(
      vi.mocked(imagePreparer).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(imageUploader).mock.invocationCallOrder[0]);
  });

  it("uploads the prepared image using the correct resource type", async () => {
    await service.process("user-1", "Comment text", "comments", imageFile);

    expect(imageUploader).toHaveBeenCalledWith(
      preparedImage,
      "user-1",
      "comments",
    );
  });

  it("maps upload result into imageMeta", async () => {
    const result = await service.process(
      "user-1",
      "Post text",
      "posts",
      imageFile,
    );

    expect(result.imageMeta).toEqual({
      storageBucket: "post-images",
      storageLocation: "posts/user-1",
      fileName: "post.webp",
      downloadToken: "download-token",
      contentType: "image/webp",
      sizeBytes: 12345,
    });
    expect(result.imageMeta).not.toHaveProperty("publicUrl");
  });

  it("includes moderation result in the returned processed content", async () => {
    vi.mocked(moderator).mockResolvedValue(pendingModeration);

    const result = await service.process("user-1", "Post text", "posts", null);

    expect(result).toEqual(pendingModeration);
  });

  it("propagates prepare failures", async () => {
    const error = new Error("prepare failed");
    vi.mocked(imagePreparer).mockRejectedValue(error);

    await expect(
      service.process("user-1", "Post text", "posts", imageFile),
    ).rejects.toThrow("prepare failed");
    expect(moderator).not.toHaveBeenCalled();
    expect(imageUploader).not.toHaveBeenCalled();
  });

  it("propagates moderation failures", async () => {
    const error = new Error("moderation failed");
    vi.mocked(moderator).mockRejectedValue(error);

    await expect(
      service.process("user-1", "Post text", "posts", imageFile),
    ).rejects.toThrow("moderation failed");
    expect(imagePreparer).toHaveBeenCalledWith(imageFile);
    expect(imageUploader).not.toHaveBeenCalled();
  });

  it("propagates upload failures", async () => {
    const error = new Error("upload failed");
    vi.mocked(imageUploader).mockRejectedValue(error);

    await expect(
      service.process("user-1", "Post text", "posts", imageFile),
    ).rejects.toThrow("upload failed");
    expect(imagePreparer).toHaveBeenCalledWith(imageFile);
    expect(moderator).toHaveBeenCalledWith("user-1", "Post text", imageFile);
  });
});
