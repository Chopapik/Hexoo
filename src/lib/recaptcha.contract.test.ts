import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyRecaptchaToken } from "./recaptcha";

type RecaptchaResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  score?: number;
  "error-codes"?: string[];
};

function mockFetchResponse(body: RecaptchaResponse, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok,
      status,
      json: async () => body,
    })),
  );
}

describe("RECAPTCHA-001 verifyRecaptchaToken", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.RECAPTCHA_SECRET_KEY = "secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a valid response bound to expected action and hostname", async () => {
    mockFetchResponse({
      success: true,
      score: 0.9,
      action: "register",
      hostname: "hexoo.test",
      challenge_ts: "2026-06-18T10:00:00.000Z",
    });

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).resolves.toBe(true);
  });

  it.each([
    ["success false", { success: false }],
    ["wrong action", { action: "login" }],
    ["wrong hostname", { hostname: "evil.test" }],
    ["low score", { score: 0.1 }],
  ])("fails closed for %s", async (_label, override) => {
    mockFetchResponse({
      success: true,
      score: 0.9,
      action: "register",
      hostname: "hexoo.test",
      challenge_ts: "2026-06-18T10:00:00.000Z",
      ...override,
    });

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("accepts an otherwise valid response even when challenge_ts is old", async () => {
    mockFetchResponse({
      success: true,
      score: 0.9,
      action: "register",
      hostname: "hexoo.test",
      challenge_ts: "2020-01-01T00:00:00.000Z",
    });

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).resolves.toBe(true);
  });

  it("accepts an otherwise valid response without challenge_ts", async () => {
    mockFetchResponse({
      success: true,
      score: 0.9,
      action: "register",
      hostname: "hexoo.test",
    });

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).resolves.toBe(true);
  });

  it("fails closed for non-2xx verifier response", async () => {
    mockFetchResponse({}, false, 503);

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).rejects.toMatchObject({ code: "EXTERNAL_SERVICE" });
  });

  it("fails closed for malformed response body and missing config", async () => {
    mockFetchResponse({ success: true });

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    delete process.env.RECAPTCHA_SECRET_KEY;

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("fails closed on verifier timeout before accepting the token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_url: string, init?: RequestInit) =>
          await new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("aborted", "AbortError"));
            });
          }),
      ),
    );

    await expect(
      verifyRecaptchaToken("token", {
        expectedAction: "register",
        allowedHostnames: ["hexoo.test"],
        timeoutMs: 1,
      }),
    ).rejects.toMatchObject({ code: "EXTERNAL_SERVICE" });
  });
});
