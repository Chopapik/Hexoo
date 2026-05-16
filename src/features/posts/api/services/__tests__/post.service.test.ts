import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostService } from "../post.service";
import { createAppError } from "@/lib/AppError";
import {
  createMockPost,
  createMockPostEnricher,
  createMockPostModerationWorkflow,
  createMockPostRepository,
  createMockUseCase,
} from "./helpers/post-test.helpers";
import type { CreatePostUseCase } from "../use-cases/create-post.use-case";
import type { UpdatePostUseCase } from "../use-cases/update-post.use-case";
import type { DeletePostUseCase } from "../use-cases/delete-post.use-case";
import type { ReportPostUseCase } from "../use-cases/report-post.use-case";

describe("PostService", () => {
  const mockRepository = createMockPostRepository({
    getPostById: vi.fn(),
    getPosts: vi.fn(),
    getPostsByUserId: vi.fn(),
  });

  const mockEnricher = createMockPostEnricher();
  const mockModerationWorkflow = createMockPostModerationWorkflow();

  const createPostUseCase = createMockUseCase<CreatePostUseCase>();
  const updatePostUseCase = createMockUseCase<UpdatePostUseCase>();
  const deletePostUseCase = createMockUseCase<DeletePostUseCase>();
  const reportPostUseCase = createMockUseCase<ReportPostUseCase>();

  let service: PostService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PostService(
      mockRepository,
      mockEnricher,
      mockModerationWorkflow,
      createPostUseCase,
      updatePostUseCase,
      deletePostUseCase,
      reportPostUseCase,
    );
  });

  it("delegates createPost and returns its result", async () => {
    const data = { text: "Hello", youtubeUrl: "" };
    vi.mocked(createPostUseCase.execute).mockResolvedValue({
      postId: "p1",
      isPending: false,
      isNSFW: false,
    });

    const result = await service.createPost(data);

    expect(createPostUseCase.execute).toHaveBeenCalledWith(data);
    expect(result).toEqual({
      postId: "p1",
      isPending: false,
      isNSFW: false,
    });
  });

  it("delegates updatePost and returns its result", async () => {
    const data = { text: "Updated" };
    vi.mocked(updatePostUseCase.execute).mockResolvedValue({
      id: "p1",
      text: "Updated",
    } as Awaited<ReturnType<UpdatePostUseCase["execute"]>>);

    const result = await service.updatePost("p1", data);

    expect(updatePostUseCase.execute).toHaveBeenCalledWith("p1", data);
    expect(result).toEqual({ id: "p1", text: "Updated" });
  });

  it("delegates deletePost", async () => {
    await service.deletePost("p1");

    expect(deletePostUseCase.execute).toHaveBeenCalledWith("p1");
  });

  it("delegates reportPost", async () => {
    vi.mocked(reportPostUseCase.execute).mockResolvedValue({
      hidden: false,
      reportsCount: 1,
    });

    const result = await service.reportPost("p1", "spam", "details");

    expect(reportPostUseCase.execute).toHaveBeenCalledWith("p1", "spam", "details");
    expect(result).toEqual({ hidden: false, reportsCount: 1 });
  });

  describe("getPostById", () => {
    it("throws NOT_FOUND if ID is empty", async () => {
      await expect(service.getPostById(" ")).rejects.toThrowError(
        createAppError({ code: "NOT_FOUND", message: "Empty ID" }),
      );
    });

    it("throws NOT_FOUND if post not found", async () => {
      vi.mocked(mockRepository.getPostById).mockResolvedValue(null);
      await expect(service.getPostById("p1")).rejects.toThrowError(
        createAppError({ code: "NOT_FOUND", message: "Post not found" }),
      );
    });

    it("returns enriched post if found", async () => {
      const post = createMockPost({ id: "p1", text: "Hi" });
      vi.mocked(mockRepository.getPostById).mockResolvedValue(post);
      vi.mocked(mockEnricher.enrichOne).mockResolvedValue({
        ...post,
        userName: "Test",
        userAvatarUrl: null,
      });

      const result = await service.getPostById("p1");
      expect(mockEnricher.enrichOne).toHaveBeenCalledWith(post, null);
      expect(result.userName).toBe("Test");
    });
  });

  describe("getPosts", () => {
    it("returns enriched posts", async () => {
      const posts = [createMockPost({ id: "p1" }), createMockPost({ id: "p2" })];
      vi.mocked(mockRepository.getPosts).mockResolvedValue(posts);
      vi.mocked(mockEnricher.enrich).mockResolvedValue(
        posts.map((p) => ({ ...p, userName: "U", userAvatarUrl: null })),
      );

      const result = await service.getPosts(10, "start");
      expect(mockRepository.getPosts).toHaveBeenCalledWith(10, "start");
      expect(mockEnricher.enrich).toHaveBeenCalledWith(posts, null);
      expect(result).toHaveLength(2);
    });
  });

  describe("getPostsByUserId", () => {
    it("returns enriched posts for user", async () => {
      const posts = [createMockPost({ id: "p1" })];
      vi.mocked(mockRepository.getPostsByUserId).mockResolvedValue(posts);
      vi.mocked(mockEnricher.enrich).mockResolvedValue(
        posts.map((p) => ({ ...p, userName: "U", userAvatarUrl: null })),
      );

      const result = await service.getPostsByUserId("u1", 10, "start");
      expect(mockRepository.getPostsByUserId).toHaveBeenCalledWith("u1", 10, "start");
      expect(mockEnricher.enrich).toHaveBeenCalledWith(posts, null);
      expect(result).toHaveLength(1);
    });
  });
});
