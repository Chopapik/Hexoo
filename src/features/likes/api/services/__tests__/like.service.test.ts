import { beforeEach, describe, expect, it, vi } from "vitest";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import type { LikeRepository } from "../../repositories/like.repository.interface";
import { LikeService } from "../like.service";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(),
}));

function createRepository(): LikeRepository {
  return {
    setLikeState: vi.fn(),
    getLikesForParents: vi.fn(),
  };
}

const session: SessionData = {
  uid: "user-like-1",
  email: "likes@example.test",
  name: "Like User",
  role: UserRole.User,
};

describe("LikeService", () => {
  let repository: LikeRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createRepository();
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("rejects missing session before calling the repository", async () => {
    const service = new LikeService(repository, null);

    await expect(
      service.setLikeState("post-1", "posts", true),
    ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });

    expect(repository.setLikeState).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
  });

  it("rejects blank parentId before calling the repository", async () => {
    const service = new LikeService(repository, session);

    await expect(service.setLikeState("   ", "posts", true)).rejects.toMatchObject(
      { code: "INVALID_INPUT" },
    );

    expect(repository.setLikeState).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
  });

  it("sends explicit target state and returns the repository result", async () => {
    const service = new LikeService(repository, session);
    const authoritativeResult = { liked: false, likesCount: 42 };
    vi.mocked(repository.setLikeState).mockResolvedValue(authoritativeResult);

    const result = await service.setLikeState("post-9", "posts", false);

    expect(repository.setLikeState).toHaveBeenCalledWith({
      userId: "user-like-1",
      parentId: "post-9",
      parentCollection: "posts",
      liked: false,
    });
    expect(result).toBe(authoritativeResult);
    expect(logActivity).toHaveBeenCalledWith(
      "user-like-1",
      "LIKE_TOGGLED",
      "User set like=false on posts (post-9)",
    );
    expect(
      vi.mocked(repository.setLikeState).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(logActivity).mock.invocationCallOrder[0]);
  });

  it("does not log activity when the repository mutation fails", async () => {
    const service = new LikeService(repository, session);
    vi.mocked(repository.setLikeState).mockRejectedValue(new Error("db failed"));

    await expect(
      service.setLikeState("comment-4", "comments", true),
    ).rejects.toThrow("db failed");

    expect(logActivity).not.toHaveBeenCalled();
  });

  it("returns an empty list for empty parent IDs without querying", async () => {
    const service = new LikeService(repository, session);

    await expect(
      service.getLikesForParents("user-like-1", "comments", []),
    ).resolves.toEqual([]);

    expect(repository.getLikesForParents).not.toHaveBeenCalled();
  });
});
