/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useRegister from "../useRegister";

const { push, signUp } = vi.hoisted(() => ({
  push: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn() },
}));

vi.mock("@/i18n/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabaseClient: { auth: { signUp } },
}));

const registration = {
  name: "Alice",
  email: "alice@example.test",
  password: "password-123",
  terms: true as const,
};

describe("AUTH-ENUMERATION-001 registration client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["new email", null],
    ["existing email", { message: "User already exists" }],
  ])("uses the same neutral completion path for %s", async (_case, error) => {
    signUp.mockResolvedValue({ error });
    const onError = vi.fn();
    const { result } = renderHook(() => useRegister(onError));

    await act(async () => {
      await result.current.handleRegister(registration);
    });

    expect(signUp).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      "/verify-email?email=alice%40example.test",
    );
    expect(onError).not.toHaveBeenCalledWith(
      "auth/email-already-exists",
      "email",
    );
  });
});
