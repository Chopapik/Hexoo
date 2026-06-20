import {
  hasFile,
  prepareImage,
  uploadPreparedImage,
} from "@/features/images/api/image.service";
import {
  performModeration,
  type ModerationLogPayloadForResource,
} from "@/features/moderation/utils/assessSafety";
import type { ImageMeta } from "@/features/images/types/image.type";

export type ContentResource = "posts" | "comments";

type ContentProcessResult = {
  isPending: boolean;
  isNSFW: boolean;
  imageMeta?: ImageMeta | null;
  /** When isPending: log with resourceType and resourceId after create/update. */
  moderationLogPayloadForResource?: ModerationLogPayloadForResource;
};

export class PostContentService {
  constructor(
    private readonly imagePreparer = prepareImage,
    private readonly imageUploader = uploadPreparedImage,
    private readonly moderator = performModeration,
  ) {}

  async process(
    uid: string,
    text: string,
    resource: ContentResource,
    imageFile?: File | null,
  ): Promise<ContentProcessResult> {
    // Validate byte/MIME/resource limits before OpenAI can read or receive the
    // image. The prepared buffer is then reused by Sharp during upload.
    const preparedImage = hasFile(imageFile)
      ? await this.imagePreparer(imageFile)
      : undefined;
    const moderation = await this.moderator(uid, text, imageFile);

    let imageData: Pick<ContentProcessResult, "imageMeta"> = {};

    if (preparedImage) {
      const upload = await this.imageUploader(preparedImage, uid, resource);
      const imageMeta: ImageMeta = {
        storageBucket: upload.storageBucket,
        storageLocation: upload.storageLocation,
        fileName: upload.fileName,
        downloadToken: upload.downloadToken,
        contentType: upload.contentType,
        sizeBytes: upload.sizeBytes,
      };
      imageData = { imageMeta };
    }

    return { ...moderation, ...imageData };
  }
}
