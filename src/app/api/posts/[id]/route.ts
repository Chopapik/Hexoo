import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { UpdatePostDto } from "@/features/posts/types/post.dto";
import {
  deletePost,
  getPostById,
  updatePost,
} from "@/features/posts/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const GET = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession().catch(() => null);
    const post = await getPostById(session, id);
    return handleSuccess(post);
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const text = String(form.get("text") || "");
      const device = String(form.get("device"));
      const imageFile = form.get("imageFile");

      const result = await updatePost(session, id, {
        text,
        device,
        imageFile,
      } as UpdatePostDto);
      return handleSuccess(result, 201);
    }

    const body = await req.json();
    const result = await updatePost(session, id, body);
    return handleSuccess(result, 201);
  },
);

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    await deletePost(session, id);
    return handleSuccess();
  },
);
