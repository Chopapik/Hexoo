import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisFromEnv = vi.fn();
const limit = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: redisFromEnv,
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(() => ({ type: "sliding-window" }));

    limit = limit;
  },
}));

describe("rateLimit", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("allows test requests when rate limits are disabled without Redis or console errors", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.ENABLE_RATE_LIMITS;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { assertAuthLoginRateLimit } = await import("../rateLimit");
    const req = {
      headers: {
        get: vi.fn(() => null),
      },
    };

    await expect(assertAuthLoginRateLimit(req as never)).resolves.toBeUndefined();

    expect(redisFromEnv).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
