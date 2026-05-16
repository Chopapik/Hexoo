import { describe, it, expect } from "vitest";
import {
  BlockUserSchema,
  CreateUserSchema,
  RestrictUserSchema,
  UpdateUserSchema,
} from "./user.dto";
import { UserRole } from "./user.type";

describe("CreateUserSchema", () => {
  it("parses a valid payload", () => {
    const result = CreateUserSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      role: UserRole.User,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Ada",
        email: "ada@example.com",
        role: UserRole.User,
      });
    }
  });

  it("rejects invalid email", () => {
    const result = CreateUserSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      role: UserRole.User,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = CreateUserSchema.safeParse({
      name: "",
      email: "ada@example.com",
      role: UserRole.User,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = CreateUserSchema.safeParse({
      name: "a".repeat(51),
      email: "ada@example.com",
      role: UserRole.User,
    });
    expect(result.success).toBe(false);
  });

  it("rejects role outside UserRole enum", () => {
    const result = CreateUserSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      role: "guest",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateUserSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(UpdateUserSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial updates with valid fields", () => {
    const result = UpdateUserSchema.safeParse({
      name: "New",
      isActive: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email when provided", () => {
    const result = UpdateUserSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name when provided", () => {
    const result = UpdateUserSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("BlockUserSchema", () => {
  it("parses when all strings are non-empty", () => {
    const result = BlockUserSchema.safeParse({
      uidToBlock: "u1",
      bannedBy: "mod-1",
      bannedReason: "spam",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uidToBlock", () => {
    const result = BlockUserSchema.safeParse({
      uidToBlock: "",
      bannedBy: "mod-1",
      bannedReason: "spam",
    });
    expect(result.success).toBe(false);
  });
});

describe("RestrictUserSchema", () => {
  it("parses valid uid and reason", () => {
    const result = RestrictUserSchema.safeParse({
      uid: "user-1",
      reason: "policy",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uid", () => {
    const result = RestrictUserSchema.safeParse({
      uid: "",
      reason: "policy",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty reason", () => {
    const result = RestrictUserSchema.safeParse({
      uid: "user-1",
      reason: "",
    });
    expect(result.success).toBe(false);
  });
});
