import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { readPaginationParams } from "@/lib/http/requestParsing";
import {
  getOptionalUserFromSession,
  getUserFromSession,
} from "@/features/auth/api/utils/session-user.service";
import { NextRequest } from "next/server";
import { CreatePostRequestDto } from "@/features/posts/types/post.dto";
import { createPost, getPosts } from "@/features/posts/api/services";
import { isFileLike } from "@/features/images/utils/isFileLike";
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const text = String(form.get("text") || "");
    const imageFileRaw = form.get("imageFile");
    const imageFile = isFileLike(imageFileRaw) ? imageFileRaw : undefined;
    const youtubeUrl = form.get("youtubeUrl")
      ? String(form.get("youtubeUrl"))
      : undefined;
    const result = await createPost(session, {
      text,
      imageFile,
      youtubeUrl,
    } as CreatePostRequestDto);
    return handleSuccess(result, 201);
  }
  const body = await req.json();
  const result = await createPost(session, body);
  return handleSuccess(result, 201);
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getOptionalUserFromSession();
  const { limit, startAfter } = readPaginationParams(req.nextUrl.searchParams);

  const result = await getPosts(session, limit, startAfter);
  return handleSuccess(result);
});
