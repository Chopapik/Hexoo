import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppError } from "@/lib/AppError";
import { invokeRoute } from "@/test/helpers/apiRouteHarness";
import { UserRole } from "@/features/users/types/user.type";

vi.mock("@/lib/recaptcha", () => ({
  verifyRecaptchaToken: vi.fn(async () => true),
}));

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getUserFromSession: vi.fn(async () => ({
    uid: "user-001",
    email: "user@example.test",
    name: "User",
    role: UserRole.User,
    isBanned: false,
  })),
}));

vi.mock("@/features/me/api/services", () => ({
  updatePassword: vi.fn(async () => undefined),
}));

import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { updatePassword } from "@/features/me/api/services";
import { PUT as updatePasswordRoute } from "../route";

const passwordBody = {
  oldPassword: "old-password",
  newPassword: "new-password",
  reNewPassword: "new-password",
};

describe("password route reCAPTCHA action contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyRecaptchaToken).mockResolvedValue(true);
    vi.mocked(updatePassword).mockResolvedValue(undefined);
  });

  it("accepts update_password before reaching the password use-case boundary", async () => {
    const response = await invokeRoute(updatePasswordRoute, {
      method: "PUT",
      url: "/api/me/password",
      body: {
        type: "json",
        value: {
          ...passwordBody,
          recaptchaToken: "update-password-token",
        },
      },
    });

    expect(response.status).toBe(204);
    expect(verifyRecaptchaToken).toHaveBeenCalledWith(
      "update-password-token",
      expect.objectContaining({ expectedAction: "update_password" }),
    );
    expect(updatePassword).toHaveBeenCalledOnce();
    expect(updatePassword).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "user-001" }),
      passwordBody,
    );
  });

  it("rejects a token for the wrong action before reaching the password use-case boundary", async () => {
    vi.mocked(verifyRecaptchaToken).mockImplementationOnce(
      async (_token, { expectedAction }) => {
        if (expectedAction !== "password_change") {
          throw createAppError({
            code: "FORBIDDEN",
            message: "recaptcha action mismatch",
          });
        }

        return true;
      },
    );

    const response = await invokeRoute(updatePasswordRoute, {
      method: "PUT",
      url: "/api/me/password",
      body: {
        type: "json",
        value: {
          ...passwordBody,
          recaptchaToken: "password-change-token",
        },
      },
    });

    expect(response.status).toBe(403);
    expect(verifyRecaptchaToken).toHaveBeenCalledWith(
      "password-change-token",
      expect.objectContaining({ expectedAction: "update_password" }),
    );
    expect(updatePassword).not.toHaveBeenCalled();
  });
});
