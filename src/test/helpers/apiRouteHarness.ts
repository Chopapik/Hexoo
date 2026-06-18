import { expect } from "vitest";
import { NextRequest } from "next/server";
import type {
  AnyRouteContext,
  AnyRouteParams,
} from "@/lib/http/routeWrapper";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteHandler<P extends AnyRouteParams = AnyRouteParams> = (
  request: NextRequest,
  context: AnyRouteContext<P>,
) => Response | Promise<Response>;

export type RouteRequestBody =
  | { type: "json"; value: unknown }
  | { type: "formData"; value: FormData }
  | { type: "text"; value: string }
  | { type: "empty" };

export type CreateRouteRequestOptions = {
  method?: HttpMethod;
  url: string;
  baseUrl?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  body?: RouteRequestBody;
  cookies?: Record<string, string>;
};

export type InvokeRouteOptions<P extends AnyRouteParams = AnyRouteParams> =
  CreateRouteRequestOptions & {
    params?: P;
  };

export type ParsedRouteResponse<TBody = unknown> = {
  status: number;
  ok: boolean;
  headers: Headers;
  body: TBody | string | null;
  text: string;
};

type ApiErrorEnvelope = {
  ok: false;
  error: {
    code: string;
    data?: Record<string, unknown>;
  };
};

const DEFAULT_BASE_URL = "http://localhost";

function appendQuery(
  targetUrl: URL,
  query: CreateRouteRequestOptions["query"],
): void {
  if (!query) return;

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    targetUrl.searchParams.set(key, String(value));
  }
}

function serializeCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("; ");
}

function bodyToRequestInit(
  body: RouteRequestBody | undefined,
  headers: Headers,
): Pick<RequestInit, "body"> {
  if (!body || body.type === "empty") {
    return {};
  }

  if (body.type === "json") {
    headers.set("Content-Type", "application/json");
    return { body: JSON.stringify(body.value) };
  }

  if (body.type === "formData") {
    return { body: body.value };
  }

  return { body: body.value };
}

export function createRouteRequest({
  method = "GET",
  url,
  baseUrl = DEFAULT_BASE_URL,
  query,
  headers,
  body,
  cookies,
}: CreateRouteRequestOptions): NextRequest {
  const targetUrl = new URL(url, baseUrl);
  appendQuery(targetUrl, query);

  const requestHeaders = new Headers(headers);
  if (cookies && Object.keys(cookies).length > 0) {
    requestHeaders.set("Cookie", serializeCookies(cookies));
  }

  return new NextRequest(targetUrl, {
    method,
    headers: requestHeaders,
    ...bodyToRequestInit(body, requestHeaders),
  });
}

export function createRouteContext<P extends AnyRouteParams>(
  params: P,
): AnyRouteContext<P> {
  return {
    params: Promise.resolve(params),
  };
}

export async function invokeRoute<P extends AnyRouteParams>(
  handler: RouteHandler<P>,
  options: InvokeRouteOptions<P>,
): Promise<Response> {
  const request = createRouteRequest(options);
  const context = createRouteContext(options.params ?? ({} as P));

  return handler(request, context);
}

export async function readRouteResponse<TBody = unknown>(
  response: Response,
): Promise<ParsedRouteResponse<TBody>> {
  if (response.status === 204) {
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      body: null,
      text: "",
    };
  }

  const text = await response.text();
  if (text.length === 0) {
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      body: null,
      text,
    };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      body: JSON.parse(text) as TBody,
      text,
    };
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    body: text,
    text,
  };
}

export async function readJsonResponse<TBody = unknown>(
  response: Response,
): Promise<TBody | null> {
  const parsed = await readRouteResponse<TBody>(response);
  return parsed.body === "" ? null : (parsed.body as TBody | null);
}

export async function readTextResponse(response: Response): Promise<string> {
  const parsed = await readRouteResponse(response);
  return parsed.text;
}

export function expectStatus(response: Response, expectedStatus: number): void {
  expect(response.status).toBe(expectedStatus);
}

export function expectApiErrorEnvelope(
  body: unknown,
  expectedCode?: string,
): asserts body is ApiErrorEnvelope {
  expect(body).toMatchObject({
    ok: false,
    error: {
      code: expectedCode ?? expect.any(String),
    },
  });
}
