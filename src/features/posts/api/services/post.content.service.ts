import { hasFile, uploadImage } from "@/features/images/api/image.service";
import {
  performModeration,
  type ModerationLogPayloadForResource,
} from "@/features/moderation/utils/assessSafety";
import type { ImageMeta } from "@/features/images/types/image.type";

type PostContentProcessResult = {
  isPending: boolean;
  isNSFW: boolean;
  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;
  /** When isPending: log with resourceType "post" and resourceId after create/update. */
  moderationLogPayloadForResource?: ModerationLogPayloadForResource;
};

export class PostContentService {
  async process(
    uid: string,
    text: string,
    imageFile?: File | null,
  ): Promise<PostContentProcessResult> {
    const moderation = await performModeration(uid, text, imageFile);

    let imageData: Pick<PostContentProcessResult, "imageUrl" | "imageMeta"> =
      {};

    if (hasFile(imageFile) && imageFile instanceof File) {
      const upload = await uploadImage(imageFile, uid, "posts");
      imageData = {
        imageUrl: upload.publicUrl,
        imageMeta: {
          storagePath: upload.storagePath,
          downloadToken: upload.downloadToken,
          publicUrl: upload.publicUrl,
          contentType: upload.contentType,
          sizeBytes: upload.sizeBytes,
        },
      };
    }

    return { ...moderation, ...imageData };
  }
}
