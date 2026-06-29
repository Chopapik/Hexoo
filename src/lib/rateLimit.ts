import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { createAppError } from "@/lib/AppError";

type RateLimitName =
  | "authLoginIp"
  | "authRegisterIp"
  | "authRegisterEmail"
  | "authSessionIp"
  | "publicLookupIp"
  | "createPostUser"
  | "createPostIp"
  | "updatePostUser"
  | "deletePostUser"
  | "reportPostUser"
  | "createCommentUser"
  | "createCommentIp"
  | "updateCommentUser"
  | "deleteCommentUser"
  | "reportCommentUser"
  | "likeUser"
  | "imageUploadUser"
  | "avatarUploadUser"
  | "profileUpdateUser"
  | "settingsUpdateUser"
  | "adminModeratorUser"
  | "demoResetIp";

const isProd = process.env.NODE_ENV === "production";
const hasRedisEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

function createRedisClient() {
  if (!hasRedisEnv) {
    return null;
  }

  return Redis.fromEnv();
}

const redis = createRedisClient();

function createLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string,
) {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter,
    prefix,
  });
}

const limiters: Record<RateLimitName, Ratelimit | null> = {
  authLoginIp: createLimiter(
    Ratelimit.slidingWindow(5, "1 m"),
    "rl:auth:login:ip",
  ),
  authRegisterIp: createLimiter(
    Ratelimit.slidingWindow(3, "10 m"),
    "rl:auth:register:ip",
  ),
  authRegisterEmail: createLimiter(
    Ratelimit.slidingWindow(3, "30 m"),
    "rl:auth:register:email",
  ),
  authSessionIp: createLimiter(
    Ratelimit.slidingWindow(30, "1 m"),
    "rl:auth:session:ip",
  ),
  publicLookupIp: createLimiter(
    Ratelimit.slidingWindow(60, "1 m"),
    "rl:public:lookup:ip",
  ),
  createPostUser: createLimiter(
    Ratelimit.slidingWindow(5, "10 m"),
    "rl:post:create:user",
  ),
  createPostIp: createLimiter(
    Ratelimit.slidingWindow(20, "10 m"),
    "rl:post:create:ip",
  ),
  updatePostUser: createLimiter(
    Ratelimit.slidingWindow(20, "10 m"),
    "rl:post:update:user",
  ),
  deletePostUser: createLimiter(
    Ratelimit.slidingWindow(20, "10 m"),
    "rl:post:delete:user",
  ),
  reportPostUser: createLimiter(
    Ratelimit.slidingWindow(10, "1 h"),
    "rl:post:report:user",
  ),
  createCommentUser: createLimiter(
    Ratelimit.slidingWindow(15, "10 m"),
    "rl:comment:create:user",
  ),
  createCommentIp: createLimiter(
    Ratelimit.slidingWindow(40, "10 m"),
    "rl:comment:create:ip",
  ),
  updateCommentUser: createLimiter(
    Ratelimit.slidingWindow(30, "10 m"),
    "rl:comment:update:user",
  ),
  deleteCommentUser: createLimiter(
    Ratelimit.slidingWindow(30, "10 m"),
    "rl:comment:delete:user",
  ),
  reportCommentUser: createLimiter(
    Ratelimit.slidingWindow(10, "1 h"),
    "rl:comment:report:user",
  ),
  likeUser: createLimiter(
    Ratelimit.slidingWindow(60, "1 m"),
    "rl:like:user",
  ),
  imageUploadUser: createLimiter(
    Ratelimit.slidingWindow(5, "10 m"),
    "rl:image:upload:user",
  ),
  avatarUploadUser: createLimiter(
    Ratelimit.slidingWindow(5, "10 m"),
    "rl:avatar:upload:user",
  ),
  profileUpdateUser: createLimiter(
    Ratelimit.slidingWindow(10, "10 m"),
    "rl:profile:update:user",
  ),
  settingsUpdateUser: createLimiter(
    Ratelimit.slidingWindow(10, "10 m"),
    "rl:settings:update:user",
  ),
  adminModeratorUser: createLimiter(
    Ratelimit.slidingWindow(60, "1 m"),
    "rl:admin-moderator:mutation:user",
  ),
  demoResetIp: createLimiter(
    Ratelimit.slidingWindow(5, "10 m"),
    "rl:demo:reset:ip",
  ),
};

function firstHeaderIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function getClientIp(req: NextRequest) {
  return (
    firstHeaderIp(req.headers.get("cf-connecting-ip")) ||
    firstHeaderIp(req.headers.get("true-client-ip")) ||
    firstHeaderIp(req.headers.get("x-real-ip")) ||
    firstHeaderIp(req.headers.get("x-forwarded-for")) ||
    "unknown"
  );
}

async function assertLimit(
  limiterName: RateLimitName,
  identifier: string,
  message: string,
) {
  const limiter = limiters[limiterName];

  if (!limiter) {
    if (!isProd) return;

    throw createAppError({
      code: "INTERNAL_ERROR",
      message: "Server misconfiguration: Upstash Redis env vars are missing.",
    });
  }

  const result = await limiter.limit(identifier);

  if (!result.success) {
    throw createAppError({
      code: "RATE_LIMITED",
      message,
      data: {
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      },
    });
  }
}

export async function assertAuthLoginRateLimit(req: NextRequest) {
  await assertLimit(
    "authLoginIp",
    `ip:${getClientIp(req)}`,
    "Too many login attempts. Try again later.",
  );
}

export async function assertAuthRegisterRateLimit(
  req: NextRequest,
  email?: string,
) {
  await assertLimit(
    "authRegisterIp",
    `ip:${getClientIp(req)}`,
    "Too many register attempts. Try again later.",
  );

  if (email) {
    await assertLimit(
      "authRegisterEmail",
      `email:${email.toLowerCase().trim()}`,
      "Too many register attempts for this email. Try again later.",
    );
  }
}

export async function assertAuthSessionRateLimit(req: NextRequest) {
  await assertLimit(
    "authSessionIp",
    `ip:${getClientIp(req)}`,
    "Too many session requests. Try again later.",
  );
}

export async function assertPublicLookupRateLimit(req: NextRequest) {
  await assertLimit(
    "publicLookupIp",
    `ip:${getClientIp(req)}`,
    "Too many lookup requests. Try again later.",
  );
}

export async function assertCreatePostRateLimit(
  req: NextRequest,
  userId: string,
) {
  await assertLimit(
    "createPostUser",
    `user:${userId}`,
    "You are creating posts too quickly. Try again later.",
  );

  await assertLimit(
    "createPostIp",
    `ip:${getClientIp(req)}`,
    "Too many post requests from this IP. Try again later.",
  );
}

export async function assertUpdatePostRateLimit(userId: string) {
  await assertLimit(
    "updatePostUser",
    `user:${userId}`,
    "You are updating posts too quickly. Try again later.",
  );
}

export async function assertDeletePostRateLimit(userId: string) {
  await assertLimit(
    "deletePostUser",
    `user:${userId}`,
    "You are deleting posts too quickly. Try again later.",
  );
}

export async function assertReportPostRateLimit(userId: string) {
  await assertLimit(
    "reportPostUser",
    `user:${userId}`,
    "You are reporting posts too quickly. Try again later.",
  );
}

export async function assertCreateCommentRateLimit(
  req: NextRequest,
  userId: string,
) {
  await assertLimit(
    "createCommentUser",
    `user:${userId}`,
    "You are creating comments too quickly. Try again later.",
  );

  await assertLimit(
    "createCommentIp",
    `ip:${getClientIp(req)}`,
    "Too many comment requests from this IP. Try again later.",
  );
}

export async function assertUpdateCommentRateLimit(userId: string) {
  await assertLimit(
    "updateCommentUser",
    `user:${userId}`,
    "You are updating comments too quickly. Try again later.",
  );
}

export async function assertDeleteCommentRateLimit(userId: string) {
  await assertLimit(
    "deleteCommentUser",
    `user:${userId}`,
    "You are deleting comments too quickly. Try again later.",
  );
}

export async function assertReportCommentRateLimit(userId: string) {
  await assertLimit(
    "reportCommentUser",
    `user:${userId}`,
    "You are reporting comments too quickly. Try again later.",
  );
}

export async function assertLikeRateLimit(userId: string) {
  await assertLimit(
    "likeUser",
    `user:${userId}`,
    "You are changing reactions too quickly. Try again later.",
  );
}

export async function assertImageUploadRateLimit(userId: string) {
  await assertLimit(
    "imageUploadUser",
    `user:${userId}`,
    "You are uploading images too quickly. Try again later.",
  );
}

export async function assertAvatarUploadRateLimit(userId: string) {
  await assertLimit(
    "avatarUploadUser",
    `user:${userId}`,
    "You are updating your avatar too quickly. Try again later.",
  );
}

export async function assertProfileUpdateRateLimit(userId: string) {
  await assertLimit(
    "profileUpdateUser",
    `user:${userId}`,
    "You are updating your profile too quickly. Try again later.",
  );
}

export async function assertSettingsUpdateRateLimit(userId: string) {
  await assertLimit(
    "settingsUpdateUser",
    `user:${userId}`,
    "You are updating settings too quickly. Try again later.",
  );
}

export async function assertAdminModeratorRateLimit(userId: string) {
  await assertLimit(
    "adminModeratorUser",
    `user:${userId}`,
    "Too many moderation requests. Try again later.",
  );
}

export async function assertDemoResetRateLimit(req: NextRequest) {
  await assertLimit(
    "demoResetIp",
    `ip:${getClientIp(req)}`,
    "Too many demo reset requests. Try again later.",
  );
}
