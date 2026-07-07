import { describe, expect, it } from "vitest";
import { BaseUsernameSchema } from "./usernameSchema";

function expectIssueMessage(raw: string, message: string) {
  const result = BaseUsernameSchema.safeParse(raw);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.map((issue) => issue.message)).toContain(
      message,
    );
  }
}

describe("BaseUsernameSchema", () => {
  it("trims whitespace around valid usernames", () => {
    const result = BaseUsernameSchema.safeParse("  valid_user123  ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("valid_user123");
    }
  });

  it("accepts underscores and numbers", () => {
    expect(BaseUsernameSchema.safeParse("alpha_123").success).toBe(true);
  });

  it("rejects too-short usernames", () => {
    expectIssueMessage("ab", "name_too_short");
  });

  it("rejects too-long usernames", () => {
    expectIssueMessage("a".repeat(51), "name_too_long");
  });

  it("rejects usernames with spaces", () => {
    expectIssueMessage("valid user", "name_invalid_chars");
  });

  it("rejects usernames with special characters", () => {
    expectIssueMessage("valid-user", "name_invalid_chars");
  });

  it("rejects blocked usernames", () => {
    expectIssueMessage("Admin", "name_forbidden");
  });

  it("rejects deterministic profane usernames", () => {
    expectIssueMessage("fuck", "name_policy_violation");
  });
});
