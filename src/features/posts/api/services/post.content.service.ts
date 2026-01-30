import { hasFile, uploadImage } from "@/features/images/api/imageService";
import { performModeration } from "@/features/moderation/utils/assessSafety";
import type { ImageMeta } from "@/features/images/types/image.type";

type PostContentProcessResult = {
  moderationStatus: "approved" | "pending" | "rejected";
  isNSFW: boolean;
  flaggedReasons: string[];
  flaggedSource: ("text" | "image")[];
  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;
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
