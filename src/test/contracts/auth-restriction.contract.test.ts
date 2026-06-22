import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("AUTH-RESTRICTION-001 legacy containment", () => {
  it("does not expose restriction or unrestriction service actions", () => {
    const serviceIndex = read("src/features/users/api/services/index.ts");
    const service = read("src/features/users/api/services/user.service.ts");
    const serviceInterface = read(
      "src/features/users/api/services/user.service.interface.ts",
    );

    for (const source of [serviceIndex, service, serviceInterface]) {
      expect(source).not.toMatch(/restrictUser|unrestrictUser|RestrictionApplier/);
    }
  });

  it("does not use the legacy flag to block post or comment creation", () => {
    const createPost = read(
      "src/features/posts/api/services/use-cases/create-post.use-case.ts",
    );
    const addComment = read(
      "src/features/comments/api/services/use-cases/add-comment.use-case.ts",
    );
    const postGuards = read("src/features/posts/api/services/post.guards.ts");
    const commentGuards = read(
      "src/features/comments/api/services/comment.guards.ts",
    );

    for (const source of [createPost, addComment, postGuards, commentGuards]) {
      expect(source).not.toMatch(/isRestricted|account_restricted|assertNotRestricted/);
    }
  });

  it("keeps schema-era restriction columns isolated in the repository layer", () => {
    const repository = read(
      "src/features/users/api/repositories/user.supabase.repository.ts",
    );
    expect(repository).toContain("updateUserRestriction");
  });
});
