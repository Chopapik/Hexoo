import { describe, expect, it, vi } from "vitest";
const routeDependencies = vi.hoisted(() => ({ createPost: vi.fn() }));
vi.mock("@/features/images/api/image.service", () => ({
  hasFile: (value: unknown) =>
    !!value && typeof value === "object" && "size" in value && value.size > 0,
  prepareImage: vi.fn(),
  uploadPreparedImage: vi.fn(),
}));
vi.mock("@/features/moderation/utils/assessSafety", () => ({
  performModeration: vi.fn(),
}));
vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(async () => ({ uid: "user-1" })),
  getOptionalUserFromSession: vi.fn(),
}));
vi.mock("@/features/posts/api/services", () => ({
  createPost: routeDependencies.createPost,
  getPosts: vi.fn(),
}));
import {
  assertImageUploadRequestSize,
  prepareImageUpload,
  type ImageResourceLimits,
  withImageProcessingTimeout,
} from "./image-resource-limits";
import { PostContentService } from "@/features/posts/api/services/post.content.service";
import { POST as createPostRoute } from "@/app/api/posts/route";
import { NextRequest } from "next/server";

const limits: ImageResourceLimits = {
  maxBytes: 10,
  maxWidth: 100,
  maxHeight: 100,
  maxPixels: 5_000,
  maxFrames: 2,
  probeTimeoutMs: 100,
  allowedMimeTypes: ["image/png"],
};

function file(bytes: number, type = "image/png") {
  return new File([new Uint8Array(bytes)], "fixture", { type });
}

describe("UPLOAD-RESOURCE-LIMITS-001", () => {
  it.each([null, "11", "invalid"])(
    "rejects missing/oversized/invalid body length before parsing: %s",
    (contentLength) => {
      const headers = { get: vi.fn(() => contentLength) };
      expect(() => assertImageUploadRequestSize(headers, 10)).toThrow();
    },
  );

  it("rejects an oversized multipart request at the route before formData parsing", async () => {
    const request = new NextRequest("http://localhost/api/posts", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=test",
        "content-length": "10000000",
      },
      body: "not-parsed",
    });
    const formData = vi.spyOn(request, "formData");
    const response = await createPostRoute(request, {
      params: Promise.resolve({}),
    });
    expect(response.status).toBe(400);
    expect(formData).not.toHaveBeenCalled();
    expect(routeDependencies.createPost).not.toHaveBeenCalled();
  });

  it.each([
    ["dimensions", { width: 101, height: 10, pages: 1 }],
    ["pixels", { width: 80, height: 80, pages: 1 }],
    ["frames", { width: 10, height: 10, pages: 3 }],
  ])("rejects excessive %s through a fake metadata probe", async (_, metadata) => {
    await expect(
      prepareImageUpload(file(4), vi.fn(async () => metadata), limits),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it.each([
    [file(11), "oversized bytes"],
    [file(1, "text/plain"), "unsupported MIME"],
  ])("rejects %s before reading bytes or probing", async (fixture) => {
    const read = vi.spyOn(fixture, "arrayBuffer");
    const probe = vi.fn();
    await expect(prepareImageUpload(fixture, probe, limits)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(read).not.toHaveBeenCalled();
    expect(probe).not.toHaveBeenCalled();
  });

  it("allows a bounded image and returns reusable bytes", async () => {
    const result = await prepareImageUpload(
      file(4),
      vi.fn(async () => ({ width: 50, height: 50, pages: 1 })),
      limits,
    );
    expect(result.inputBuffer).toHaveLength(4);
    expect(result.metadata).toEqual({ width: 50, height: 50, pages: 1 });
  });

  it("bounds decoder/Sharp processing time without a real decoder", async () => {
    vi.useFakeTimers();
    const result = expect(
      withImageProcessingTimeout(new Promise(() => undefined), 10),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await vi.advanceTimersByTimeAsync(10);
    await result;
    vi.useRealTimers();
  });

  it("does not start OpenAI moderation or upload when preparation fails", async () => {
    const prepare = vi.fn().mockRejectedValue({ code: "VALIDATION_ERROR" });
    const upload = vi.fn();
    const moderate = vi.fn();
    const service = new PostContentService(prepare, upload, moderate);

    await expect(
      service.process("user-1", "text", "posts", file(4)),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(moderate).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });
});
