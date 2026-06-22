import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/AppError";
import fetchClient from "@/lib/fetchClient";
import { handleError } from "@/lib/http/responseHelpers";

describe("CLIENT-ERROR-ENVELOPE-001", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("emits the stable route error envelope without internal details", async () => {
    const response = handleError(
      "VALIDATION_ERROR",
      "Invalid payload",
      { field: "name" },
      400,
      { stack: "private" },
    );

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        data: { field: "name" },
      },
    });
  });

  it.each([
    [400, "VALIDATION_ERROR"],
    [401, "AUTH_REQUIRED"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [409, "CONFLICT"],
    [502, "EXTERNAL_SERVICE"],
    [503, "SERVICE_UNAVAILABLE"],
  ] as const)("maps an unstructured %s response to %s", async (status, code) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("provider failure", { status }),
      ),
    );

    await expect(fetchClient.get("/test")).rejects.toMatchObject<Partial<ApiError>>({
      code,
      status,
    });
  });

  it("preserves a structured application error code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { ok: false, error: { code: "ACCOUNT_DELETED" } },
          { status: 403 },
        ),
      ),
    );

    await expect(fetchClient.get("/test")).rejects.toMatchObject({
      code: "ACCOUNT_DELETED",
      status: 403,
    });
  });

  it("parses a 204 response as null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    await expect(fetchClient.post("/no-content")).resolves.toBeNull();
  });
});
