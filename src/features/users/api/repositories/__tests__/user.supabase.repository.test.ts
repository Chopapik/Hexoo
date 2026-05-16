import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserRole } from "@/features/users/types/user.type";
import type { UserRow } from "@/features/users/types/user.row";
import { UserSupabaseRepository } from "../user.supabase.repository";

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

function mockSelectEqMaybeSingleChain(
  mockData: UserRow | null,
  mockError: { message: string; code?: string } | null = null,
) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: mockError }),
  };
  return chain;
}

function sampleUserRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    uid: "user-123",
    display_name: "macer",
    display_name_normalized: "macer",
    email: "gggf80169@gmail.com",
    role: UserRole.User,
    avatar_meta: null,
    created_at: "2026-05-15T16:03:00.000Z",
    updated_at: "2026-05-15T16:03:28.908Z",
    last_online: "2026-05-15T16:03:00.000Z",
    is_active: true,
    is_banned: false,
    banned_at: null,
    banned_by: null,
    banned_reason: null,
    is_restricted: false,
    restricted_at: null,
    restricted_by: null,
    restriction_reason: null,
    last_known_ip: null,
    ...overrides,
  };
}

describe("UserSupabaseRepository", () => {
  let repository: UserSupabaseRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    repository = new UserSupabaseRepository();
  });

  describe("getUserByUid", () => {
    it("returns mapped UserEntity when the database returns a row", async () => {
      const fakeDbRow = sampleUserRow();

      mockFrom.mockReturnValue(
        mockSelectEqMaybeSingleChain(fakeDbRow) as ReturnType<typeof mockFrom>,
      );

      const result = await repository.getUserByUid("user-123");

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(result).not.toBeNull();
      expect(result?.uid).toBe("user-123");
      expect(result?.name).toBe("macer");
      expect(result?.email).toBe("gggf80169@gmail.com");
      expect(result?.hasUsername).toBe(true);
      expect(result?.createdAt).toEqual(new Date("2026-05-15T16:03:00.000Z"));
      expect(result?.lastOnline).toEqual(new Date("2026-05-15T16:03:00.000Z"));
    });

    it("returns null when the database returns no row", async () => {
      mockFrom.mockReturnValue(
        mockSelectEqMaybeSingleChain(null) as ReturnType<typeof mockFrom>,
      );

      const result = await repository.getUserByUid("ghost-user");

      expect(result).toBeNull();
    });

    it("throws when Supabase returns an error", async () => {
      mockFrom.mockReturnValue(
        mockSelectEqMaybeSingleChain(null, {
          message: "Row not found",
          code: "PGRST116",
        }) as ReturnType<typeof mockFrom>,
      );

      await expect(repository.getUserByUid("ghost-user")).rejects.toThrow(
        "Row not found",
      );
    });
  });

  describe("getUsersByIds", () => {
    it("maps uid, display_name, and avatar_meta from chunk queries", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            {
              uid: "u1",
              display_name: "One",
              avatar_meta: null,
            },
          ],
          error: null,
        }),
      };
      mockFrom.mockReturnValue(chain as ReturnType<typeof mockFrom>);

      const result = await repository.getUsersByIds(["u1"]);

      expect(result).toEqual({
        u1: { name: "One", avatarMeta: null },
      });
      expect(chain.select).toHaveBeenCalledWith("uid, display_name, avatar_meta");
      expect(chain.in).toHaveBeenCalledWith("uid", ["u1"]);
    });

    it("returns empty record for empty uid list without querying", async () => {
      const result = await repository.getUsersByIds([]);

      expect(result).toEqual({});
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });
});
