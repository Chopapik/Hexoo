import { hasFile, uploadImage } from "@/features/images/api/image.service";
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
  async process(
    uid: string,
    text: string,
    resource: ContentResource,
    imageFile?: File | null,
  ): Promise<ContentProcessResult> {
    const moderation = await performModeration(uid, text, imageFile);

    let imageData: Pick<ContentProcessResult, "imageMeta"> = {};

    if (hasFile(imageFile) && imageFile instanceof File) {
      const upload = await uploadImage(imageFile, uid, resource);
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
