import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { NextRequest } from "next/server";
import { CreatePostDto } from "@/features/posts/types/post.dto";
import { postService } from "@/features/posts/api/services/ index";
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const text = String(form.get("text") || "");
    const device = String(form.get("device"));
    const imageFile = form.get("imageFile");
    const result = await postService.createPost(session, {
      text,
      device,
      imageFile,
    } as CreatePostDto);
    return handleSuccess(result, 201);
  }
  const body = await req.json();
  await postService.createPost(session, body);
  return handleSuccess();
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const result = await postService.getPosts(limit, startAfter, session);
  return handleSuccess(result);
});
