import type { HttpMethod } from "@/test/helpers/apiRouteHarness";

export type ApiSchemaBodyEncoding = "none" | "json" | "formData";

export type ApiSchemaMatrixEntry = {
  contractId: "CLIENT-API-SCHEMA-MATRIX-001";
  route: string;
  method: HttpMethod;
  bodyEncoding: ApiSchemaBodyEncoding;
  requiresBody: boolean;
  queryParameters: string[];
  expectedSuccessStatus: number;
  successHasJson: boolean;
  successAllowsNoContent: boolean;
  expectedErrorEnvelope: boolean;
  clientOrHook: string | null;
  batch: 0;
};

export const apiSchemaMatrix = [
  {
    contractId: "CLIENT-API-SCHEMA-MATRIX-001",
    route: "/api/users/by-ids",
    method: "POST",
    bodyEncoding: "json",
    requiresBody: true,
    queryParameters: [],
    expectedSuccessStatus: 200,
    successHasJson: true,
    successAllowsNoContent: false,
    expectedErrorEnvelope: true,
    clientOrHook: null,
    batch: 0,
  },
  {
    contractId: "CLIENT-API-SCHEMA-MATRIX-001",
    route: "/api/user/profile/[uid]",
    method: "GET",
    bodyEncoding: "none",
    requiresBody: false,
    queryParameters: [],
    expectedSuccessStatus: 200,
    successHasJson: true,
    successAllowsNoContent: false,
    expectedErrorEnvelope: true,
    clientOrHook: "useProfile",
    batch: 0,
  },
  {
    contractId: "CLIENT-API-SCHEMA-MATRIX-001",
    route: "/api/posts",
    method: "GET",
    bodyEncoding: "none",
    requiresBody: false,
    queryParameters: ["limit", "startAfter"],
    expectedSuccessStatus: 200,
    successHasJson: true,
    successAllowsNoContent: false,
    expectedErrorEnvelope: true,
    clientOrHook: "usePosts",
    batch: 0,
  },
  {
    contractId: "CLIENT-API-SCHEMA-MATRIX-001",
    route: "/api/posts",
    method: "POST",
    bodyEncoding: "formData",
    requiresBody: true,
    queryParameters: [],
    expectedSuccessStatus: 201,
    successHasJson: true,
    successAllowsNoContent: false,
    expectedErrorEnvelope: true,
    clientOrHook: "useCreatePost",
    batch: 0,
  },
  {
    contractId: "CLIENT-API-SCHEMA-MATRIX-001",
    route: "/api/auth/last-online",
    method: "POST",
    bodyEncoding: "none",
    requiresBody: false,
    queryParameters: ["force"],
    expectedSuccessStatus: 204,
    successHasJson: false,
    successAllowsNoContent: true,
    expectedErrorEnvelope: true,
    clientOrHook: "SessionWatcher",
    batch: 0,
  },
] as const satisfies readonly ApiSchemaMatrixEntry[];

export const deferredContractViolations = [
  {
    contractId: "CLIENT-API-BLOCK-001",
    batch: 1,
    reason: "Admin block/unblock body and authorization behavior belongs to Batch 1.",
  },
  {
    contractId: "CLIENT-ERROR-ENVELOPE-001",
    batch: 8,
    reason: "Proxy-wide error envelope convergence belongs to Batch 8.",
  },
] as const;
