import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import {
  createPost,
  getPosts,
} from "@/features/posts/api/services/postService";
import { NextRequest } from "next/server";
import { CreatePost } from "@/features/posts/types/post.type";
export const POST = withErrorHandling(async (req: NextRequest) => {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const text = String(form.get("text") || "");
    const device = String(form.get("device"));
    const imageFile = form.get("imageFile");
    const result = await createPost({
      text,
      device,
      imageFile,
    } as CreatePost);
    return handleSuccess(result, 201);
  }
  const body = await req.json();
  await createPost(body);
  return handleSuccess();
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const result = await getPosts(limit, startAfter);
  return handleSuccess(result);
});
