import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import type { ImageMeta } from "@/features/images/types/image.type";

vi.mock("@/features/users/api/services", () => ({
  getUsersByIds: vi.fn(),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn((meta: unknown) =>
    meta ? "https://img.example/asset" : undefined,
  ),
}));

import { getUsersByIds } from "@/features/users/api/services";

function jsonReq(body: unknown) {
  return new NextRequest("http://localhost/api/users/by-ids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const staticRouteCtx = { params: Promise.resolve({}) };

const sampleAvatarMeta: ImageMeta = {
  storageBucket: "b",
  storageLocation: "l",
  fileName: "x",
  downloadToken: "t",
  contentType: "image/png",
  sizeBytes: 0,
};

describe("POST /api/users/by-ids (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error payload when body is not a uids array", async () => {
    const res = await POST(jsonReq({}), staticRouteCtx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_INPUT");
  });

  it("returns empty users when all uids are blank after filtering", async () => {
    const res = await POST(jsonReq({ uids: ["  ", ""] }), staticRouteCtx);
    expect(getUsersByIds).not.toHaveBeenCalled();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ users: [] });
  });

  it("dedupes, caps length, skips users without trimmed name, resolves avatar urls", async () => {
    vi.mocked(getUsersByIds).mockResolvedValue({
      u1: { name: "One", avatarMeta: sampleAvatarMeta },
      u2: { name: "   ", avatarMeta: null },
    });

    const uids = ["u1", "u1", "u2", "u3"];
    while (uids.length < 45) {
      uids.push(`extra-${uids.length}`);
    }

    const res = await POST(jsonReq({ uids }), staticRouteCtx);

    expect(getUsersByIds).toHaveBeenCalledTimes(1);
    const passed = vi.mocked(getUsersByIds).mock.calls[0][0];
    expect(passed.length).toBe(40);
    expect(new Set(passed).size).toBe(passed.length);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({
      users: [
        { uid: "u1", name: "One", avatarUrl: "https://img.example/asset" },
      ],
    });
  });
});
