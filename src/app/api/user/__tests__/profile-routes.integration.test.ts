import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { UserProfileResponseDto } from "@/features/users/types/user.dto";
import { GET } from "../profile/[uid]/route";

vi.mock("@/features/users/api/services", () => ({
  getUserProfile: vi.fn(),
}));

import { getUserProfile } from "@/features/users/api/services";

const sampleUser: UserProfileResponseDto = {
  uid: "user-xyz",
  name: "Ada",
  avatarUrl: null,
  createdAt: new Date("2024-01-01"),
  lastOnline: new Date("2024-01-02"),
};

describe("GET /api/user/profile/[uid] (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns wrapped profile data when resolved", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({ user: sampleUser });

    const req = new NextRequest("http://localhost/api/user/profile/user-xyz");
    const res = await GET(req, {
      params: Promise.resolve({ uid: "  user-xyz  " }),
    });

    expect(res.status).toBe(200);
    expect(getUserProfile).toHaveBeenCalledWith("  user-xyz  ");
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({
      user: {
        uid: sampleUser.uid,
        name: sampleUser.name,
        avatarUrl: sampleUser.avatarUrl,
        createdAt: sampleUser.createdAt.toISOString(),
        lastOnline: sampleUser.lastOnline.toISOString(),
      },
    });
  });

  it("returns null payload when profile missing", async () => {
    vi.mocked(getUserProfile).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/user/profile/user-xyz");
    const res = await GET(req, {
      params: Promise.resolve({ uid: "user-xyz" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toBeNull();
  });
});
