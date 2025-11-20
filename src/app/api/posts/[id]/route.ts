import { getPostById, updatePost } from "@/features/posts/api/postService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const post = await getPostById(id);
    return handleSuccess(post);
  }
);

export const PUT = withErrorHandling(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const text = String(form.get("text") || "");
      const device = String(form.get("device"));
      const imageFile = form.get("imageFile") as any;

      const result = await updatePost(id, {
        text,
        device,
        imageFile,
      } as any);
      return handleSuccess(result, 201);
    }

    const body = await req.json();
    const result = await updatePost(id, body);
    return handleSuccess(result, 201);
  }
);
