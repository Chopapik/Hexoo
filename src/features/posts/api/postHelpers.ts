import { hasFile, uploadImage } from "@/features/images/api/imageService";
import { performModeration } from "@/features/moderation/utils/assessSafety";

export default async function processPostContent(
  uid: string,
  text: string,
  imageFile?: File | null
) {
  const moderation = await performModeration(uid, text, imageFile);

  let imageData = null;
  if (hasFile(imageFile) && imageFile instanceof File) {
    const upload = await uploadImage(imageFile, uid, "posts");
    imageData = {
      imageUrl: upload.publicUrl,
      imageMeta: {
        storagePath: upload.storagePath,
        downloadToken: upload.downloadToken,
      },
    };
  }

  return { ...moderation, ...imageData };
}
