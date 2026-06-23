import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("../repositories/implementations/supabaseAuthRepository", () => ({
  SupabaseAuthRepository: vi.fn(function SupabaseAuthRepository() {
    return {
      refreshSession: vi.fn(),
      verifyIdToken: vi.fn(),
    };
  }),
}));

vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    getUserByUid: vi.fn(),
  },
}));

import { isUserAuthenticated } from "./session.service";

function e2eSessionCookie() {
  return Buffer.from(
    JSON.stringify({
      uid: "e2e-admin",
      email: "e2e-admin@example.test",
      name: "E2E Admin",
      role: "admin",
    }),
    "utf8",
  ).toString("base64url");
}

describe("Batch 10 E2E auth seam production guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not authenticate proxy/session requests from the E2E cookie in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("HEXOO_E2E_SMOKE", "true");

    const request = new NextRequest("http://localhost/admin", {
      headers: {
        cookie: `__hexoo_e2e_session=${e2eSessionCookie()}`,
      },
    });
    const response = NextResponse.next();

    await expect(isUserAuthenticated(request, response)).resolves.toBe(false);
  });
});
