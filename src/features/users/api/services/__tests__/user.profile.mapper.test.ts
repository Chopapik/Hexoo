import { describe, it, expect, vi } from "vitest";
import { UserProfileMapper } from "../user.profile.mapper";
import { createMockUser } from "./helpers/user-test.helpers";

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => "https://cdn.example/avatar.png"),
}));

import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";

describe("UserProfileMapper", () => {
  const mapper = new UserProfileMapper();

  it("maps entity to public profile response", () => {
    const user = createMockUser({
      uid: "u42",
      name: "Alice",
      avatarMeta: {
        storageBucket: "b",
        storageLocation: "l",
        fileName: "f",
        downloadToken: "t",
        contentType: "image/png",
        sizeBytes: 100,
      },
    });

    const profile = mapper.toProfileResponse(user);

    expect(profile).toEqual({
      uid: "u42",
      name: "Alice",
      avatarUrl: "https://cdn.example/avatar.png",
      lastOnline: user.lastOnline,
      createdAt: user.createdAt,
    });
  });

  it("omits avatarUrl when resolver returns null", () => {
    vi.mocked(resolveImagePublicUrl).mockReturnValueOnce(null);

    const profile = mapper.toProfileResponse(createMockUser());

    expect(profile.avatarUrl).toBeUndefined();
  });
});
