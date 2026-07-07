import { describe, expect, it } from "vitest";
import {
  AddCommentSchema,
  COMMENT_MAX_CHARS,
  COMMENT_MAX_IMAGE_FILE_SIZE_BYTES,
  ReportCommentSchema,
  REPORT_DETAILS_MAX_CHARS,
  UpdateCommentSchema,
} from "./comment.dto";

function expectIssueMessage(
  result: ReturnType<typeof AddCommentSchema.safeParse>,
  message: string,
) {
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.map((issue) => issue.message)).toContain(
      message,
    );
  }
}

function imageFile(bytes = 1, type = "image/png") {
  return new File([new Uint8Array(bytes)], "comment-image.png", { type });
}

describe("AddCommentSchema", () => {
  it("accepts a text-only comment", () => {
    const result = AddCommentSchema.safeParse({
      postId: "post-text-only-1",
      text: "A focused comment",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        postId: "post-text-only-1",
        text: "A focused comment",
      });
    }
  });

  it("accepts an image-only comment", () => {
    const file = imageFile();
    const result = AddCommentSchema.safeParse({
      postId: "post-image-only-1",
      text: "   ",
      imageFile: file,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageFile).toBe(file);
    }
  });

  it("rejects an empty comment without an image", () => {
    const result = AddCommentSchema.safeParse({
      postId: "post-empty-1",
      text: "   ",
    });

    expectIssueMessage(result, "comment_empty");
  });

  it("rejects text longer than COMMENT_MAX_CHARS", () => {
    const result = AddCommentSchema.safeParse({
      postId: "post-long-1",
      text: "x".repeat(COMMENT_MAX_CHARS + 1),
    });

    expectIssueMessage(result, "comment_too_long");
  });

  it("rejects unsupported image MIME types", () => {
    const result = AddCommentSchema.safeParse({
      postId: "post-mime-1",
      text: "",
      imageFile: imageFile(1, "text/plain"),
    });

    expectIssueMessage(result, "wrong_file_type");
  });

  it("rejects oversized images", () => {
    const result = AddCommentSchema.safeParse({
      postId: "post-large-image-1",
      text: "",
      imageFile: imageFile(COMMENT_MAX_IMAGE_FILE_SIZE_BYTES + 1),
    });

    expectIssueMessage(result, "file_too_big");
  });
});

describe("UpdateCommentSchema", () => {
  it("rejects blank text", () => {
    expect(UpdateCommentSchema.safeParse({ text: "" }).success).toBe(false);
  });

  it("rejects too-long text", () => {
    const result = UpdateCommentSchema.safeParse({
      text: "x".repeat(COMMENT_MAX_CHARS + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "comment_too_long",
      );
    }
  });
});

describe("ReportCommentSchema", () => {
  it("requires details for the other reason", () => {
    const result = ReportCommentSchema.safeParse({
      reason: "other",
      details: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "report_details_required",
      );
    }
  });

  it("enforces the report details max length", () => {
    const result = ReportCommentSchema.safeParse({
      reason: "spam",
      details: "x".repeat(REPORT_DETAILS_MAX_CHARS + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "report_details_too_long",
      );
    }
  });
});
