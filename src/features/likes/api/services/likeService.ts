import { createAppError } from "@/lib/AppError";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { likeRepository } from "../repositories";

export async function toggleLike(
  parentId: string,
  parentCollectionName: "posts" | "comments",
) {
  const user = await getUserFromSession();

  if (!parentId) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[likeService.toggleLike] Resource ID is missing.",
    });
  }

  await likeRepository.toggleLike(user.uid, parentId, parentCollectionName);
}
