import { expect, vi } from "vitest";
import type { ErrorCode } from "@/lib/AppError";
import { AppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import type { PostRepository } from "../../../repositories/post.repository.interface";
import type { PostEntity } from "../../../../types/post.entity";
import type { PostContentService } from "../../post.content.service";
import type { PostModerationWorkflow } from "../../post.moderation-workflow";
import type { PostEnricher } from "../../post.enricher";

export function createMockPost(overrides: Partial<PostEntity> = {}): PostEntity {
  return {
    id: "post-1",
    userId: "user-1",
    text: "Test post content",
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    isPending: false,
    isNSFW: false,
    isEdited: false,
    imageMeta: null,
    device: "Web",
    youtubeUrl: null,
    userReports: [],
    reportsMeta: [],
    ...overrides,
  };
}

export function createMockSession(
  role: UserRole = UserRole.User,
  overrides: Partial<SessionData> = {},
): SessionData {
  return {
    uid: "user-1",
    email: "user@example.com",
    name: "Test User",
    role,
    ...overrides,
  };
}

export function createRestrictedSession(overrides: Partial<SessionData> = {}): SessionData {
  return {
    ...createMockSession(),
    isRestricted: true,
    ...overrides,
  };
}

export function createMockPostRepository(
  overrides: Partial<PostRepository> = {},
): PostRepository {
  return {
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    getPostById: vi.fn(),
    getPostsByIds: vi.fn(),
    getPosts: vi.fn(),
    getPostsByUserId: vi.fn(),
    reportPost: vi.fn(),
    hasUserReportedPost: vi.fn(),
    getPostsPendingModeration: vi.fn(),
    ...overrides,
  } as PostRepository;
}

export function createMockPostContentService(
  overrides: Partial<Pick<PostContentService, "process">> = {},
): PostContentService {
  return {
    process: vi.fn<PostContentService["process"]>().mockResolvedValue({
      isPending: false,
      isNSFW: false,
      imageMeta: null,
      moderationLogPayloadForResource: null,
    }),
    ...overrides,
  } as PostContentService;
}

export function createMockPostModerationWorkflow(
  overrides: Partial<
    Pick<
      PostModerationWorkflow,
      | "recordContentModerationResult"
      | "setModerationStatus"
      | "recordUserReport"
      | "recordReportThresholdHidden"
    >
  > = {},
): PostModerationWorkflow {
  return {
    recordContentModerationResult: vi.fn(),
    setModerationStatus: vi.fn(),
    recordUserReport: vi.fn(),
    recordReportThresholdHidden: vi.fn(),
    ...overrides,
  } as PostModerationWorkflow;
}

export function createMockPostEnricher(
  overrides: Partial<Pick<PostEnricher, "enrichOne" | "enrich">> = {},
): PostEnricher {
  return {
    enrichOne: vi.fn(),
    enrich: vi.fn(),
    ...overrides,
  } as PostEnricher;
}

export function createMockUseCase<T extends { execute: (...args: never[]) => unknown }>() {
  return { execute: vi.fn() } as T;
}

export async function expectAppError(
  run: () => Promise<unknown>,
  code: ErrorCode,
): Promise<AppError> {
  try {
    await run();
    expect.unreachable("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
    return error as AppError;
  }
}
