import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { createPost, getPosts } from "@/features/posts/api/postService";

export const POST = withErrorHandling(async (req: Request) => {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const text = String(form.get("text") || "");
    const device = String(form.get("device"));
    const imageFile = form.get("imageFile") as any;

    const result = await createPost({
      text,
      device,
      imageFile,
    } as any);
    return handleSuccess(result, 201);
  }

  const body = await req.json();
  const result = await createPost(body);
  return handleSuccess(result, 201);
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const result = await getPosts(limit, startAfter);
  return handleSuccess(result);
});
