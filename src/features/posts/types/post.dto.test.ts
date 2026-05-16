import { describe, it, expect } from "vitest";
import {
  CreatePostSchema,
  POST_MAX_CHARS,
  ReportPostSchema,
  UpdatePostSchema,
} from "./post.dto";

describe("CreatePostSchema", () => {
  it("accepts image-only payload when youtubeUrl is missing", () => {
    const imageFile = new File(["img"], "post.png", { type: "image/png" });
    const result = CreatePostSchema.safeParse({
      text: "",
      imageFile,
    });
    expect(result.success).toBe(true);
  });

  it("parses valid text-only payload", () => {
    const result = CreatePostSchema.safeParse({
      text: "Hello world",
      youtubeUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("Hello world");
    }
  });

  it("rejects empty post without image or youtube", () => {
    const result = CreatePostSchema.safeParse({
      text: "   ",
      youtubeUrl: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects text longer than POST_MAX_CHARS", () => {
    const result = CreatePostSchema.safeParse({
      text: "a".repeat(POST_MAX_CHARS + 1),
      youtubeUrl: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid youtube url", () => {
    const result = CreatePostSchema.safeParse({
      text: "hello",
      youtubeUrl: "not-youtube",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid youtube url with empty text", () => {
    const result = CreatePostSchema.safeParse({
      text: "",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdatePostSchema", () => {
  it("accepts an empty object", () => {
    expect(UpdatePostSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial text update", () => {
    const result = UpdatePostSchema.safeParse({ text: "Updated" });
    expect(result.success).toBe(true);
  });

  it("rejects empty text when provided", () => {
    const result = UpdatePostSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });
});

describe("ReportPostSchema", () => {
  it("parses valid reason without details", () => {
    const result = ReportPostSchema.safeParse({ reason: "spam" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("spam");
      expect(result.data.details).toBe("");
    }
  });

  it("requires details when reason is other", () => {
    const result = ReportPostSchema.safeParse({ reason: "other" });
    expect(result.success).toBe(false);
  });

  it("accepts other reason with non-empty details", () => {
    const result = ReportPostSchema.safeParse({
      reason: "other",
      details: "custom issue",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid reason", () => {
    const result = ReportPostSchema.safeParse({ reason: "invalid" });
    expect(result.success).toBe(false);
  });
});
